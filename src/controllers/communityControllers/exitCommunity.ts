import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import CommunityMembers from "../../models/CommunityMembers";

export const exitCommunity = async (
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

    const membership = await CommunityMembers.findOne({
      where: { community_id: communityId, user_id: userId },
    });

    if (!membership) {
      sendResponse(response, 400, "User is not a member of this community");
      return;
    }

    await CommunityMembers.destroy({
      where: { community_id: communityId, user_id: userId },
    });

    sendResponse(response, 200, "Exited community successfully");
    return;
  } catch (error: any) {
    console.error("Error in exitCommunity:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities/exit/{id}:
 *   post:
 *     summary: Exit a community
 *     description: Removes the authenticated user from the specified community.
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
 *         description: Identifier of the community to exit.
 *     responses:
 *       200:
 *         description: User exited the community successfully.
 *       400:
 *         description: Community ID missing or user not a member of the community.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while exiting the community.
 */
