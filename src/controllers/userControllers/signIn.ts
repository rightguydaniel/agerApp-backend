import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import { verifyPassword } from "../../utils/services/password";
import { generateToken } from "../../utils/services/token";

export const signIn = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  try {
    if (!email) {
      sendResponse(response, 400, "Email is required to login");
      return
    }
    if (!password) {
      sendResponse(response, 400, "Password is required to login");
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendResponse(response, 400, "Invalid email format", null);
      return;
    }
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      sendResponse(response, 400, `Account with ${email} dose not exist`);
      return
    }
    const isPasswordValid = await verifyPassword(password, user?.password);
    if (!isPasswordValid) {
      sendResponse(response, 400, "Incorrect password");
      return
    }
    const data = { id: user?.id, email: user?.email, role: user?.role };

    const token = generateToken(data);
    sendResponse(response, 200, "Login successful", {
      user: { ...user?.get(), password: undefined },
      token,
    });
    return
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
 *     description: Authenticates a user with their email and password, returning a token upon successful login.
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
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
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
