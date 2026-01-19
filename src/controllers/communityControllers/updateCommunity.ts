import { Response } from "express";
import fs from "fs";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";
import {
  buildCommunityImageUrl,
  resolveLocalCommunityImagePath,
} from "../../utils/services/media";

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

    const removeExistingPictureFromDisk = () => {
      if (!community.picture) {
        return;
      }
      const isHostedImage = !community.picture.includes("/uploads/communities/");
      if (isHostedImage) {
        return;
      }
      const existingPath = resolveLocalCommunityImagePath(community.picture);
      if (fs.existsSync(existingPath)) {
        try {
          fs.unlinkSync(existingPath);
        } catch (unlinkError) {
          console.warn("Failed to remove community picture", unlinkError);
        }
      }
    };

    const nextPicture = picture
      ? (() => {
          removeExistingPictureFromDisk();
          return buildCommunityImageUrl(picture.filename);
        })()
      : community.picture;

    await community.update({
      name: name ?? community.name,
      state: state ?? community.state,
      country: country ?? community.country,
      description: description ?? community.description,
      whatsapp_link: whatsapp_link ?? community.whatsapp_link,
      phone_number: phone_number ?? community.phone_number,
      email: email ?? community.email,
      instagram_link: instagram_link ?? community.instagram_link,
      facebook_link: facebook_link ?? community.facebook_link,
      picture: nextPicture,
    });

    sendResponse(response, 200, "Community updated successfully", community);
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
 *                   example: Community updated successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     name:
 *                       type: string
 *                       example: Lagos Entrepreneurs
 *                     state:
 *                       type: string
 *                       nullable: true
 *                       example: Lagos
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: Nigeria
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: A community for founders and builders.
 *                     whatsapp_link:
 *                       type: string
 *                       nullable: true
 *                       example: https://chat.whatsapp.com/example
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                       example: "+2348012345678"
 *                     email:
 *                       type: string
 *                       nullable: true
 *                       example: hello@cplynk.com
 *                     instagram_link:
 *                       type: string
 *                       nullable: true
 *                       example: https://instagram.com/cplynk
 *                     facebook_link:
 *                       type: string
 *                       nullable: true
 *                       example: https://facebook.com/cplynk
 *                     created_by:
 *                       type: string
 *                       example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                       example: http://localhost:3030/uploads/communities/1700000000000-123456789.png
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Community ID missing or community not found.
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
 *                   example: Community not found
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
 *       403:
 *         description: Authenticated user is not the creator of the community.
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
 *                   example: Only the creator can edit this community
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Server error while updating the community.
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
