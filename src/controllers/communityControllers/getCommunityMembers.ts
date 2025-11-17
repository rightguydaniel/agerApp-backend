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

    const users = await Users.findAll({
      where: { id: userIds },
      attributes: ["id", "full_name", "email", "phone", "picture"],
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
 *                 message:
 *                   type: string
 *                   example: Community members fetched
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       full_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       picture:
 *                         type: string
 *       400:
 *         description: Community ID missing.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while fetching community members.
 */