import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import Communities from "../../models/Communities";

export const getRecentOverview = async (
  _request: JwtPayload,
  response: Response
) => {
  try {
    const [users, communities] = await Promise.all([
      Users.findAll({
        order: [["createdAt", "DESC"]],
        limit: 3,
        attributes: { exclude: ["password"] },
      }),
      Communities.findAll({
        order: [["createdAt", "DESC"]],
        limit: 3,
      }),
    ]);

    sendResponse(response, 200, "Recent users and communities fetched", {
      users,
      communities,
    });
    return;
  } catch (error: any) {
    console.error("Error in getRecentOverview:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/whats-new:
 *   get:
 *     summary: Get what's new
 *     description: Returns the 3 most recently created users and communities.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent users and communities fetched.
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
 *                   example: Recent users and communities fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                           userName:
 *                             type: string
 *                             nullable: true
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           picture:
 *                             type: string
 *                             nullable: true
 *                           role:
 *                             type: string
 *                           socials:
 *                             type: array
 *                             nullable: true
 *                             items:
 *                               type: object
 *                               properties:
 *                                 social:
 *                                   type: string
 *                                   enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                                 link:
 *                                   type: string
 *                           country:
 *                             type: string
 *                             nullable: true
 *                           state:
 *                             type: string
 *                             nullable: true
 *                           address:
 *                             type: string
 *                             nullable: true
 *                           business_name:
 *                             type: string
 *                             nullable: true
 *                           business_category:
 *                             type: string
 *                             nullable: true
 *                           isVerified:
 *                             type: boolean
 *                           isBlocked:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     communities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           state:
 *                             type: string
 *                             nullable: true
 *                           country:
 *                             type: string
 *                             nullable: true
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           whatsapp_link:
 *                             type: string
 *                             nullable: true
 *                           phone_number:
 *                             type: string
 *                             nullable: true
 *                           email:
 *                             type: string
 *                             nullable: true
 *                           instagram_link:
 *                             type: string
 *                             nullable: true
 *                           facebook_link:
 *                             type: string
 *                             nullable: true
 *                           created_by:
 *                             type: string
 *                           picture:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 *         description: Server error while fetching recent data.
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
