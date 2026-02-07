import { Response } from "express";
import { v4 } from "uuid";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import { generateOtp } from "../../utils/services/otp";
import { sendEmail } from "../../configs/email/emailConfig";
import AccountDeletionTokens from "../../models/AccountDeletionTokens";

const OTP_TTL_MINUTES = 15;

export const requestAccountDeletion = async (
  request: any,
  response: Response
) => {
  const { email } = request.body as { email?: string };

  try {
    if (!email) {
      sendResponse(response, 400, "Email is required");
      return;
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    if (user.isBlocked) {
      sendResponse(response, 403, "Account is deleted or blocked");
      return;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await AccountDeletionTokens.destroy({ where: { user_id: user.id } });
    await AccountDeletionTokens.create({
      id: v4(),
      user_id: user.id,
      email: user.email,
      token: otp,
      expires_at: expiresAt,
    });

    await sendEmail(
      user.email,
      "AgerApp Account Deletion",
      `Your account deletion code is ${otp}. This code expires in ${OTP_TTL_MINUTES} minutes.`
    );

    sendResponse(response, 200, "Deletion code sent to your email");
    return;
  } catch (error: any) {
    console.error("Error in requestAccountDeletion:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/delete-account/request:
 *   post:
 *     summary: Request account deletion
 *     description: Sends a verification code to the authenticated user's email to confirm account deletion.
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *     responses:
 *       200:
 *         description: Deletion code sent.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Account is deleted or blocked.
 *       500:
 *         description: Internal Server Error.
 */
