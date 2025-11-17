import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";

export const getProfile = async (request: JwtPayload, response: Response) => {
  try {
    const userId = request.user.id;

    const user = await Users.findOne({
      where: { id: userId },
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    sendResponse(response, 200, "User profile fetched", user);
    return;
  } catch (error: any) {
    console.error("Error in getProfile:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     description: Returns the profile details of the currently authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     role:
 *                       type: string
 *                     country:
 *                       type: string
 *                     business_name:
 *                       type: string
 *                     business_category:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: User not found.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Internal server error.
 */