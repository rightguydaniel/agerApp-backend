import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";

export const updateDescription = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const { description } = request.body as { description?: string | null };

  try {
    if (description === undefined) {
      sendResponse(response, 400, "description is required");
      return;
    }

    if (description !== null && typeof description !== "string") {
      sendResponse(response, 400, "description must be a string or null");
      return;
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    await user.update({ description });

    const safeUser = await Users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    sendResponse(response, 200, "Description updated", safeUser);
    return;
  } catch (error: any) {
    console.error("Error in updateDescription:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/description:
 *   patch:
 *     summary: Update user description
 *     description: Updates the authenticated user's profile description.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 oneOf:
 *                   - type: string
 *                     example: Agro-entrepreneur focused on sustainable farming.
 *                   - type: "null"
 *     responses:
 *       200:
 *         description: Description updated.
 *       400:
 *         description: Validation error or user not found.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while updating description.
 */
