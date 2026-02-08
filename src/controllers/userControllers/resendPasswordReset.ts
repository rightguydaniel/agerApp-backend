import { Request, Response } from "express";
import { v4 } from "uuid";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import Tokens from "../../models/Tokens";
import { generateOtp } from "../../utils/services/otp";
import { sendEmail } from "../../configs/email/emailConfig";

const OTP_TTL_MINUTES = 15;

export const resendPasswordReset = async (
  request: Request,
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
      sendResponse(response, 400, "Account with this email does not exist");
      return;
    }

    if (user.isBlocked) {
      sendResponse(response, 403, "Account is deleted or blocked");
      return;
    }

    const otp = generateOtp();

    await Tokens.destroy({ where: { email } });
    await Tokens.create({
      id: v4(),
      email,
      token: otp,
    });

    await sendEmail(
      email,
      "AgerApp Password Reset",
      `Your password reset code is ${otp}. This code expires in ${OTP_TTL_MINUTES} minutes.`
    );

    sendResponse(response, 200, `OTP sent to ${email}`);
    return;
  } catch (error: any) {
    console.error("Error resending password reset:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/password/reset/resend:
 *   post:
 *     summary: Resend password reset code
 *     description: Sends a new password reset code to the user's email.
 *     tags:
 *       - Users
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
 *         description: OTP sent.
 *       400:
 *         description: Validation error or account not found.
 *       403:
 *         description: Account is deleted or blocked.
 *       500:
 *         description: Internal Server Error.
 */
