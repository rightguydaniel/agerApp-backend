import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";

export const updateCommunity = async (
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

    if (community.created_by !== userId) {
      sendResponse(response, 403, "Only the creator can edit this community");
      return;
    }

    const {
      name,
      state,
      country,
      description,
      whatsapp_link,
      phone_number,
      email,
      instagram_link,
      facebook_link,
    } = request.body;

    const files = request.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const picture = files?.picture?.[0];

    await Communities.update(
      {
        name: name ?? community.name,
        state: state ?? community.state,
        country: country ?? community.country,
        description: description ?? community.description,
        whatsapp_link: whatsapp_link ?? community.whatsapp_link,
        phone_number: phone_number ?? community.phone_number,
        email: email ?? community.email,
        instagram_link: instagram_link ?? community.instagram_link,
        facebook_link: facebook_link ?? community.facebook_link,
        picture: picture ? picture.buffer : community.picture,
      },
      { where: { id: communityId } }
    );

    sendResponse(response, 200, "Community updated successfully");
    return;
  } catch (error: any) {
    console.error("Error in updateCommunity:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities/edit/{id}:
 *   put:
 *     summary: Update a community
 *     description: Updates details of the specified community. Only the creator of the community can update it.
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
 *         description: Identifier of the community to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               whatsapp_link:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               instagram_link:
 *                 type: string
 *               facebook_link:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Community updated successfully.
 *       400:
 *         description: Community ID missing or community not found.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not the creator of the community.
 *       500:
 *         description: Server error while updating the community.
 */