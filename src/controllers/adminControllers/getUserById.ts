import { Request, Response } from "express";
import Users from "../../models/Users";
import sendResponse from "../../utils/http/sendResponse";

export const getUserById = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!id) {
      sendResponse(response, 400, "User ID is required");
      return;
    }

    const user = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      sendResponse(response, 404, "User not found");
      return;
    }

    sendResponse(response, 200, "User retrieved", user);
  } catch (error: any) {
    console.error("Error fetching user", error.message);
    sendResponse(response, 500, "Failed to fetch user", error.message);
  }
};

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Returns a specific user by their ID. Requires admin authentication.
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
 *         description: Successfully retrieved user.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error while fetching user.
 */
