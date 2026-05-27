import { Request, Response } from "express";
import Users from "../../models/Users";
import sendResponse from "../../utils/http/sendResponse";

export const blockUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!id) {
      sendResponse(response, 400, "User ID is required");
      return;
    }

    const user = await Users.findByPk(id);

    if (!user) {
      sendResponse(response, 404, "User not found");
      return;
    }

    const isCurrentlyBlocked = user.isBlocked !== null;
    const newBlockedStatus = isCurrentlyBlocked ? null : new Date();

    await user.update({ isBlocked: newBlockedStatus });

    const updatedUser = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    const message = isCurrentlyBlocked
      ? "User unblocked successfully"
      : "User blocked successfully";

    sendResponse(response, 200, message, updatedUser);
  } catch (error: any) {
    console.error("Error toggling user block status", error.message);
    sendResponse(
      response,
      500,
      "Failed to toggle user block status",
      error.message
    );
  }
};

/**
 * @swagger
 * /admin/users/{id}/block:
 *   patch:
 *     summary: Toggle block status of a user
 *     description: Blocks or unblocks a user. Requires admin authentication.
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
 *         description: User block status toggled successfully.
 *       400:
 *         description: Missing user ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error while toggling user block status.
 */
