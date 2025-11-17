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
 *       400:
 *         description: Community ID missing, community not found, user not found, or already a member.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while joining the community.
 */
