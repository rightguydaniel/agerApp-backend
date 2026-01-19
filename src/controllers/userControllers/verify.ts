import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Tokens from "../../models/Tokens";
import Users from "../../models/Users";

export const verifyUser = async (request: Request, response: Response) => {
  const { email, otp } = request.body;
  try {
    const otpExist = await Tokens.findOne({ where: { email, token: otp } });
    if (!otpExist) {
      sendResponse(response, 400, "Incorrect OTP");
      return;
    }
    await Users.update({ isVerified: true }, { where: { email } });
    sendResponse(response, 200, "OTP verified");
    return;
  } catch (error: any) {
    console.error("Error during OTP verification:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verify a user's OTP and update their verification status.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email.
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
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
 *                   example: "OTP verified"
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Incorrect OTP provided.
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
 *                   example: "Incorrect OTP"
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Internal Server Error.
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
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: "Error details here"
 */
