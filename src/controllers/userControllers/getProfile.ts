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
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User profile fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     full_name:
 *                       type: string
 *                       example: Jane Doe
 *                     userName:
 *                       type: string
 *                       nullable: true
 *                       example: janedoe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+2348012345678"
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatar.png
 *                     role:
 *                       type: string
 *                       example: user
 *                     socials:
 *                       type: array
 *                       nullable: true
 *                       items:
 *                         type: object
 *                         properties:
 *                           social:
 *                             type: string
 *                             enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                           link:
 *                             type: string
 *                       example:
 *                         - social: INSTAGRAM
 *                           link: https://instagram.com/abc111
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: Nigeria
 *                     business_name:
 *                       type: string
 *                       nullable: true
 *                       example: CPlynk Ltd
 *                     business_category:
 *                       type: string
 *                       nullable: true
 *                       example: Logistics
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isBlocked:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-20T12:30:00.000Z
 *       400:
 *         description: User not found.
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
 *                   example: User not found
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
