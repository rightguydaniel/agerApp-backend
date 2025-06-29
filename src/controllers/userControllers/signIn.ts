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
    console.log(error.message);
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 12345
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         role:
 *                           type: string
 *                           example: user
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
 *                 message:
 *                   type: string
 *                   example: Email is required to login
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
