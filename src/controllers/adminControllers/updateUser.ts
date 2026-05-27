import { Request, Response } from "express";
import Users from "../../models/Users";
import sendResponse from "../../utils/http/sendResponse";

export const updateUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const {
      full_name,
      phone,
      role,
      description,
      business_name,
      business_category,
      country,
      state,
      address,
    } = request.body;

    if (!id) {
      sendResponse(response, 400, "User ID is required");
      return;
    }

    const user = await Users.findByPk(id);

    if (!user) {
      sendResponse(response, 404, "User not found");
      return;
    }

    const updateData: any = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (description !== undefined) updateData.description = description;
    if (business_name !== undefined) updateData.business_name = business_name;
    if (business_category !== undefined)
      updateData.business_category = business_category;
    if (country !== undefined) updateData.country = country;
    if (state !== undefined) updateData.state = state;
    if (address !== undefined) updateData.address = address;

    await user.update(updateData);

    const updatedUser = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    sendResponse(response, 200, "User updated successfully", updatedUser);
  } catch (error: any) {
    console.error("Error updating user", error.message);
    sendResponse(response, 500, "Failed to update user", error.message);
  }
};

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Updates specific user fields. Email cannot be changed. Requires admin authentication.
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *               description:
 *                 type: string
 *               business_name:
 *                 type: string
 *               business_category:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: Missing user ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error while updating user.
 */
