import { Request, Response } from "express";
import Communities from "../../models/Communities";
import sendResponse from "../../utils/http/sendResponse";

export const updateCommunity = async (
  request: Request,
  response: Response
) => {
  try {
    const { id } = request.params;
    const {
      name,
      state,
      country,
      description,
      email,
      phone_number,
      whatsapp_link,
      facebook_link,
      instagram_link,
    } = request.body;

    if (!id) {
      sendResponse(response, 400, "Community ID is required");
      return;
    }

    const community = await Communities.findByPk(id);

    if (!community) {
      sendResponse(response, 404, "Community not found");
      return;
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (description !== undefined) updateData.description = description;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (whatsapp_link !== undefined) updateData.whatsapp_link = whatsapp_link;
    if (facebook_link !== undefined) updateData.facebook_link = facebook_link;
    if (instagram_link !== undefined) updateData.instagram_link = instagram_link;

    await community.update(updateData);

    const updatedCommunity = await Communities.findByPk(id);

    sendResponse(
      response,
      200,
      "Community updated successfully",
      updatedCommunity
    );
  } catch (error: any) {
    console.error("Error updating community", error.message);
    sendResponse(response, 500, "Failed to update community", error.message);
  }
};

/**
 * @swagger
 * /admin/communities/{id}:
 *   put:
 *     summary: Update a community
 *     description: Updates community details. Requires admin authentication.
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
 *               name:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               description:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               whatsapp_link:
 *                 type: string
 *               facebook_link:
 *                 type: string
 *               instagram_link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Community updated successfully.
 *       400:
 *         description: Missing community ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: Community not found.
 *       500:
 *         description: Server error while updating community.
 */
