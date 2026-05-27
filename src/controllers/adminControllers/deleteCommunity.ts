import { Request, Response } from "express";
import Communities from "../../models/Communities";
import CommunityMembers from "../../models/CommunityMembers";
import sendResponse from "../../utils/http/sendResponse";

export const deleteCommunity = async (
  request: Request,
  response: Response
) => {
  try {
    const { id } = request.params;

    if (!id) {
      sendResponse(response, 400, "Community ID is required");
      return;
    }

    const community = await Communities.findByPk(id);

    if (!community) {
      sendResponse(response, 404, "Community not found");
      return;
    }

    // Delete community members first
    await CommunityMembers.destroy({
      where: { community_id: id },
    });

    // Delete the community
    await Communities.destroy({
      where: { id },
    });

    sendResponse(
      response,
      200,
      "Community and all members deleted successfully",
      null
    );
  } catch (error: any) {
    console.error("Error deleting community", error.message);
    sendResponse(response, 500, "Failed to delete community", error.message);
  }
};

/**
 * @swagger
 * /admin/communities/{id}:
 *   delete:
 *     summary: Delete a community
 *     description: Permanently deletes a community and all its members. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community deleted successfully.
 *       400:
 *         description: Missing community ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: Community not found.
 *       500:
 *         description: Server error while deleting community.
 */
