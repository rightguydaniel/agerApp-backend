import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import { verifyPassword } from "../../utils/services/password";
import { generateToken } from "../../utils/services/token";
import { normalizeNigerianPhoneNumber } from "../../utils/services/normalizeNigerianPhoneNumber";

export const signIn = async (request: Request, response: Response) => {
  const { username, password } = request.body;
  try {
    if (!username) {
      sendResponse(response, 400, "Email or phone is required to login");
      return;
    }
    if (!password) {
      sendResponse(response, 400, "Password is required to login");
      return;
    }
    const usernameValue =
      typeof username === "string" ? username.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let user: Users | null = null;
    if (emailRegex.test(usernameValue)) {
      user = await Users.findOne({ where: { email: usernameValue } });
    } else {
      const normalizedPhone = normalizeNigerianPhoneNumber(usernameValue);
      if (!normalizedPhone) {
        sendResponse(response, 400, "Phone number must contain at least 10 digits");
        return;
      }
      user = await Users.findOne({
        where: { phone: normalizedPhone },
      });
    }

    if (!user) {
      sendResponse(
        response,
        400,
        `Account with ${usernameValue} does not exist`
      );
      return;
    }
    if (user.isBlocked) {
      sendResponse(response, 403, "Account is deleted or blocked");
      return;
    }
    if (!user.isVerified) {
      sendResponse(
        response,
        405,
        "Account is not verified. Please verify your email."
      );
      return;
    }
    const isPasswordValid = await verifyPassword(password, user?.password);
    if (!isPasswordValid) {
      sendResponse(response, 400, "Incorrect password");
      return;
    }
    const data = { id: user?.id, email: user?.email, role: user?.role };

    const token = generateToken(data);
    sendResponse(response, 200, "Login successful", {
      user: { ...user?.get(), password: undefined },
      token,
    });
    return;
  } catch (error: any) {
    console.error("Error during user login:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User sign-in
 *     description: Authenticates a user with their email or phone and password, returning a token upon successful login.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's email address or phone number.
 *                 example: user@mailinator.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password
 *     responses:
 *       200:
 *         description: Login successful.
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
 *                   example: Login successful
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                         full_name:
 *                           type: string
 *                           example: Jane Doe
 *                         userName:
 *                           type: string
 *                           nullable: true
 *                           example: janedoe
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                           example: "+2348012345678"
 *                         picture:
 *                           type: string
 *                           nullable: true
 *                           example: https://example.com/avatar.png
 *                         role:
 *                           type: string
 *                           example: user
 *                         socials:
 *                           type: array
 *                           nullable: true
 *                           items:
 *                             type: object
 *                             properties:
 *                               social:
 *                                 type: string
 *                                 enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                               link:
 *                                 type: string
 *                           example:
 *                             - social: INSTAGRAM
 *                               link: https://instagram.com/abc111
 *                         country:
 *                           type: string
 *                           nullable: true
 *                           example: Nigeria
 *                         business_name:
 *                           type: string
 *                           nullable: true
 *                           example: CPlynk Ltd
 *                         business_category:
 *                           type: string
 *                           nullable: true
 *                           example: Logistics
 *                         isVerified:
 *                           type: boolean
 *                           example: true
 *                           description: Indicates whether the user's email has been verified.
 *                         isBlocked:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-01-15T10:00:00.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-01-20T12:30:00.000Z
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request. Missing or invalid email/password.
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
 *                   example: Email is required to login
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       405:
 *         description: Account is not verified.
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
 *                   example: Account is not verified. Please verify your email.
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
 *                   example: Error details here
 */
