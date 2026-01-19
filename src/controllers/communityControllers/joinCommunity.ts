import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";
import CommunityMembers from "../../models/CommunityMembers";
import Users from "../../models/Users";

export const joinCommunity = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const communityId = request.params.id;

  try {
    if (!communityId) {
      sendResponse(response, 400, "Community Id is missing");
      return;
    }

    const community = await Communities.findOne({ where: { id: communityId } });
    if (!community) {
      sendResponse(response, 400, "Community not found");
      return;
    }

    const user = await Users.findOne({ where: { id: userId } });
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    const existingMember = await CommunityMembers.findOne({
      where: { community_id: communityId, user_id: userId },
    });

    if (existingMember) {
      sendResponse(response, 400, "User already a member of this community");
      return;
    }

    const membership = await CommunityMembers.create({
      community_id: communityId,
      user_id: userId,
    });

    sendResponse(response, 200, "Joined community successfully", membership);
    return;
  } catch (error: any) {
    console.error("Error in joinCommunity:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities/join/{id}:
 *   post:
 *     summary: Join a community
 *     description: Adds the authenticated user as a member of the specified community.
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
 *         description: Identifier of the community to join.
 *     responses:
 *       200:
 *         description: User joined the community successfully.
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
 *                   example: Joined community successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     community_id:
 *                       type: string
 *                       example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                     user_id:
 *                       type: string
 *                       example: 1a2b3c4d-5e6f-7890-abcd-ef1234567890
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *       400:
 *         description: Community ID missing, community not found, user not found, or already a member.
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
 *                   example: User already a member of this community
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
 *         description: Server error while joining the community.
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
