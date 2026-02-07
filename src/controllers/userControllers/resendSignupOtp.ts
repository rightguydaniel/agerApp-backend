import { Request, Response } from "express";
import { v4 } from "uuid";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import Tokens from "../../models/Tokens";
import { generateOtp } from "../../utils/services/otp";
import { sendEmail } from "../../configs/email/emailConfig";

export const resendSignupOtp = async (request: Request, response: Response) => {
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

    if (user.isVerified) {
      sendResponse(response, 400, "Account is already verified");
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
      "AgerApp Registration",
      `Your registration OTP code is ${otp}`
    );

    sendResponse(response, 200, `OTP sent to ${email}`);
    return;
  } catch (error: any) {
    console.error("Error resending OTP:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/resend-otp:
 *   post:
 *     summary: Resend signup OTP
 *     description: Sends a new signup OTP to the user's email if the account is not verified.
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
 *                 description: The email address used during signup.
 *     responses:
 *       200:
 *         description: OTP sent.
 *       400:
 *         description: Validation error or account already verified.
 *       500:
 *         description: Internal Server Error.
 */
