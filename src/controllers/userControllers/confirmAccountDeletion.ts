import { Response } from "express";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import AccountDeletionTokens from "../../models/AccountDeletionTokens";
import DeletedAccounts from "../../models/DeletedAccounts";
import { hashEmail } from "../../utils/services/hash";
import { hashPassword } from "../../utils/services/password";

const REJOIN_BLOCK_DAYS = 30;

export const confirmAccountDeletion = async (
  request: any,
  response: Response
) => {
  const { email, code } = request.body as { email?: string; code?: string };

  try {
    if (!email || !code) {
      sendResponse(response, 400, "Email and code are required");
      return;
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    const tokenRecord = await AccountDeletionTokens.findOne({
      where: {
        user_id: user.id,
        email: user.email,
        token: code,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!tokenRecord) {
      sendResponse(response, 400, "Invalid or expired code");
      return;
    }

    const now = new Date();
    const allowAfter = new Date(
      now.getTime() + REJOIN_BLOCK_DAYS * 24 * 60 * 60 * 1000
    );
    const emailHash = hashEmail(user.email);

    await DeletedAccounts.upsert({
      email_hash: emailHash,
      deleted_at: now,
      allow_after: allowAfter,
    });

    const anonymizedEmail = `deleted+${user.id}@agerapp.local`;
    const randomPassword = await hashPassword(`${user.id}-${Date.now()}`);

    await user.update({
      full_name: "Deleted User",
      userName: undefined,
      email: anonymizedEmail,
      phone: undefined,
      picture: undefined,
      country: undefined,
      state: undefined,
      address: undefined,
      business_name: "Deleted Business",
      business_category: "Deleted",
      socials: null,
      isVerified: false,
      isBlocked: now,
      password: randomPassword,
    });

    await AccountDeletionTokens.destroy({ where: { user_id: user.id } });

    sendResponse(response, 200, "Account deleted successfully");
    return;
  } catch (error: any) {
    console.error("Error in confirmAccountDeletion:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/delete-account/confirm:
 *   post:
 *     summary: Confirm account deletion
 *     description: Verifies the deletion code and deletes/anonymizes the account.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted.
 *       400:
 *         description: Validation error or invalid code.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Internal Server Error.
 */
