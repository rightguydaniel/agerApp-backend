import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import CommunityMembers from "../../models/CommunityMembers";
import Users from "../../models/Users";

export const getCommunityMembers = async (
  request: JwtPayload,
  response: Response
) => {
  const communityId = request.params.id;

  try {
    if (!communityId) {
      sendResponse(response, 400, "Community Id is missing");
      return;
    }

    const memberships = await CommunityMembers.findAll({
      where: { community_id: communityId },
    });

    const userIds = memberships.map((m) => m.user_id);

    if (userIds.length === 0) {
      sendResponse(response, 200, "Community members fetched", []);
      return;
    }

    const users = await Users.findAll({
      where: { id: userIds },
      attributes: { exclude: ["password"] },
    });

    sendResponse(response, 200, "Community members fetched", users);
    return;
  } catch (error: any) {
    console.error("Error in getCommunityMembers:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities/members/{id}:
 *   get:
 *     summary: Get members of a community
 *     description: Returns the list of users who are members of the specified community.
 *     tags:
 *       - Communities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifier of the community.
 *     responses:
 *       200:
 *         description: List of community members.
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
 *                   example: Community members fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                       full_name:
 *                         type: string
 *                         example: Jane Doe
 *                       userName:
 *                         type: string
 *                         nullable: true
 *                         example: janedoe
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: "+2348012345678"
 *                       picture:
 *                         type: string
 *                         nullable: true
 *                         example: https://example.com/avatar.png
 *                       role:
 *                         type: string
 *                         example: user
 *                       socials:
 *                         type: array
 *                         nullable: true
 *                         items:
 *                           type: object
 *                           properties:
 *                             social:
 *                               type: string
 *                               enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                             link:
 *                               type: string
 *                         example:
 *                           - social: INSTAGRAM
 *                             link: https://instagram.com/abc111
 *                       country:
 *                         type: string
 *                         nullable: true
 *                         example: Nigeria
 *                       business_name:
 *                         type: string
 *                         nullable: true
 *                         example: CPlynk Ltd
 *                       business_category:
 *                         type: string
 *                         nullable: true
 *                         example: Logistics
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                       isBlocked:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Community ID missing.
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
 *                   example: Community Id is missing
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
 *         description: Server error while fetching community members.
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
