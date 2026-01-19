import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";
import { buildCommunityImageUrl } from "../../utils/services/media";

export const createCommunity = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;

  try {
    const {
      name,
      state,
      country,
      description,
      phone_number,
      email,
      whatsapp_link,
      instagram_link,
      facebook_link,
    } = request.body;

    if (!name) {
      sendResponse(response, 400, "Community name is required");
      return;
    }

    const files = request.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const picture = files?.picture?.[0];

    const community = await Communities.create({
      name,
      state,
      country,
      description,
      whatsapp_link,
      phone_number,
      email,
      instagram_link,
      facebook_link,
      created_by: userId,
      picture: picture ? buildCommunityImageUrl(picture.filename) : null,
    });

    sendResponse(response, 200, "Community created successfully", community);
    return;
  } catch (error: any) {
    console.error("Error in createCommunity:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities/create:
 *   post:
 *     summary: Create a community
 *     description: Creates a new community. Only authenticated users can create communities.
 *     tags:
 *       - Communities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the community.
 *               state:
 *                 type: string
 *                 description: State where the community is based.
 *               country:
 *                 type: string
 *                 description: Country where the community is based.
 *               description:
 *                 type: string
 *                 description: Description of the community.
 *               whatsapp_link:
 *                 type: string
 *                 description: WhatsApp group link for the community.
 *               phone_number:
 *                 type: string
 *                 description: Contact phone number for the community.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email for the community.
 *               instagram_link:
 *                 type: string
 *                 description: Instagram link for the community.
 *               facebook_link:
 *                 type: string
 *                 description: Facebook link for the community.
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: Optional community picture upload.
 *     responses:
 *       200:
 *         description: Community created successfully.
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
 *                   example: Community created successfully
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
 *                       example: 2024-01-15T10:00:00.000Z
 *       400:
 *         description: Validation error (e.g., missing name).
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
 *                   example: Community name is required
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
 *         description: Server error while creating the community.
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
