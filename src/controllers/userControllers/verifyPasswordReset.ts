import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import Tokens from "../../models/Tokens";
import { hashPassword } from "../../utils/services/password";

const OTP_TTL_MINUTES = 15;

export const verifyPasswordReset = async (
  request: Request,
  response: Response
) => {
  const { email, otp, password } = request.body as {
    email?: string;
    otp?: string;
    password?: string;
  };

  try {
    if (!email || !otp || !password) {
      sendResponse(response, 400, "Email, otp, and password are required");
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

    const otpExist = await Tokens.findOne({
      where: {
        email,
        token: otp,
      },
    });

    if (!otpExist) {
      sendResponse(response, 400, "Incorrect or expired OTP");
      return;
    }

    const hashedPassword = await hashPassword(password);
    await user.update({ password: hashedPassword });
    await Tokens.destroy({ where: { email } });

    sendResponse(response, 200, "Password reset successful");
    return;
  } catch (error: any) {
    console.error("Error verifying password reset:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/password/reset/verify:
 *   post:
 *     summary: Verify password reset
 *     description: Verifies the reset code and updates the user's password.
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
 *               - otp
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Validation error or invalid OTP.
 *       403:
 *         description: Account is deleted or blocked.
 *       500:
 *         description: Internal Server Error.
 */
