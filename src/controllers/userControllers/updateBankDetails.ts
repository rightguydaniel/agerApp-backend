import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import UserBankDetails from "../../models/UserBankDetails";

export const updateBankDetails = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const { bank_name, account_number, account_name } = request.body as {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };

  try {
    if (!bank_name || !account_number || !account_name) {
      sendResponse(response, 400, "bank_name, account_number, and account_name are required");
      return;
    }

    const existing = await UserBankDetails.findOne({
      where: { user_id: userId },
    });

    const bankDetails = existing
      ? await existing.update({ bank_name, account_number, account_name })
      : await UserBankDetails.create({
          user_id: userId,
          bank_name,
          account_number,
          account_name,
        });

    sendResponse(response, 200, "Bank details updated", bankDetails);
    return;
  } catch (error: any) {
    console.error("Error in updateBankDetails:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/bank-details:
 *   post:
 *     summary: Add or update bank details
 *     description: Adds or updates the authenticated user's bank account details.
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
 *               - bank_name
 *               - account_number
 *               - account_name
 *             properties:
 *               bank_name:
 *                 type: string
 *                 example: First Bank
 *               account_number:
 *                 type: string
 *                 example: "0123456789"
 *               account_name:
 *                 type: string
 *                 example: Jane Doe
 *     responses:
 *       200:
 *         description: Bank details updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Bank details updated
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     user_id:
 *                       type: string
 *                       example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                     bank_name:
 *                       type: string
 *                       example: First Bank
 *                     account_number:
 *                       type: string
 *                       example: "0123456789"
 *                     account_name:
 *                       type: string
 *                       example: Jane Doe
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: bank_name, account_number, and account_name are required
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Authentication token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Server error while updating bank details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: Error details here
 */
