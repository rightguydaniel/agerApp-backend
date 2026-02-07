import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users, { userRole } from "../../models/Users";
import { v4 } from "uuid";
import { hashPassword } from "../../utils/services/password";
import { sendEmail } from "../../configs/email/emailConfig";
import { generateOtp } from "../../utils/services/otp";
import Tokens from "../../models/Tokens";
import DeletedAccounts from "../../models/DeletedAccounts";
import { hashEmail } from "../../utils/services/hash";
import { Op } from "sequelize";
import UserSettings from "../../models/UserSettings";

export const signUp = async (request: Request, response: Response) => {
  const {
    fullName,
    email,
    phone,
    country,
    state,
    address,
    businessName,
    businessCategory,
    password,
  } = request.body;
  try {
    if (!fullName || !email || !phone) {
      sendResponse(response, 400, "Missing fields", null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendResponse(response, 400, "Invalid email format", null);
      return;
    }
    const emailHash = hashEmail(email);
    const blockedRecord = await DeletedAccounts.findOne({
      where: {
        email_hash: emailHash,
        allow_after: { [Op.gt]: new Date() },
      },
    });
    if (blockedRecord) {
      sendResponse(
        response,
        409,
        "This email was recently deleted. Please try again later."
      );
      return;
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await Users.create({
      id: v4(),
      full_name: fullName,
      email,
      phone,
      role: userRole.USER,
      country,
      state,
      address,
      business_name: businessName,
      business_category: businessCategory,
      password: hashedPassword,
      isVerified: false,
    });
    await UserSettings.create({
      id: v4(),
      user_id: newUser.id,
      currency: "NGN",
      notification: true,
      taxes_rate: 7.5,
      taxes_enabled: true,
      language: "ENGLISH",
    });
    const otp = generateOtp();
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
    console.error("Error during user registration:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint allows a new user to sign up by providing their details. An OTP will be sent to the user's email for verification.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - country
 *               - businessName
 *               - businessCategory
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The full name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *               country:
 *                 type: string
 *                 description: The country of the user.
 *               state:
 *                 type: string
 *                 description: The state of the user.
 *               address:
 *                 type: string
 *                 description: The user's address.
 *               businessName:
 *                 type: string
 *                 description: The name of the user's business.
 *               businessCategory:
 *                 type: string
 *                 description: The category of the user's business.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password for the user's account.
 *     responses:
 *       200:
 *         description: OTP sent to the user's email for verification.
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
 *                   example: OTP sent to user@example.com
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Missing or invalid fields in the request body.
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
 *                   example: Missing fields
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Internal server error.
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
 *                   example: Database error
 */
