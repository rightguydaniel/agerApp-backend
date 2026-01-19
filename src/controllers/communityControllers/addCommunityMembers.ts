import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";
import CommunityMembers from "../../models/CommunityMembers";
import Users from "../../models/Users";

export const addCommunityMembers = async (
  request: JwtPayload,
  response: Response
) => {
  const communityId = request.params.id;
  const { userIds } = request.body as { userIds?: string[] };

  try {
    if (!communityId) {
      sendResponse(response, 400, "Community Id is missing");
      return;
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      sendResponse(response, 400, "userIds must be a non-empty array");
      return;
    }

    const community = await Communities.findOne({ where: { id: communityId } });
    if (!community) {
      sendResponse(response, 400, "Community not found");
      return;
    }

    const users = await Users.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id"],
    });
    const existingUserIds = users.map((user) => user.id);
    const missingUserIds = userIds.filter(
      (id) => !existingUserIds.includes(id)
    );

    if (missingUserIds.length > 0) {
      sendResponse(response, 400, "Some users were not found", missingUserIds);
      return;
    }

    const existingMembers = await CommunityMembers.findAll({
      where: {
        community_id: communityId,
        user_id: { [Op.in]: userIds },
      },
      attributes: ["user_id"],
    });
    const existingMemberIds = existingMembers.map(
      (member) => member.user_id
    );

    const newMemberIds = userIds.filter(
      (id) => !existingMemberIds.includes(id)
    );

    const createdMembers =
      newMemberIds.length > 0
        ? await CommunityMembers.bulkCreate(
            newMemberIds.map((userId) => ({
              community_id: communityId,
              user_id: userId,
            }))
          )
        : [];

    sendResponse(response, 200, "Community members added", {
      added: createdMembers,
      skipped: existingMemberIds,
    });
    return;
  } catch (error: any) {
    console.error("Error in addCommunityMembers:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities/members/{id}:
 *   post:
 *     summary: Add users to a community
 *     description: Adds multiple users to the specified community using their user IDs.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the community.
 *                 example: ["2f1b2c3d-4e5f-6789-0abc-def123456789"]
 *     responses:
 *       200:
 *         description: Community members added successfully.
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
 *                   example: Community members added
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     added:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                           community_id:
 *                             type: string
 *                             example: 1a2b3c4d-5e6f-7890-abcd-ef1234567890
 *                           user_id:
 *                             type: string
 *                             example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-15T10:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-15T10:00:00.000Z
 *                     skipped:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["2f1b2c3d-4e5f-6789-0abc-def123456789"]
 *       400:
 *         description: Validation error or missing community/users.
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
 *                   example: userIds must be a non-empty array
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
 *         description: Server error while adding community members.
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
