import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";

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
      whatsapp_link,
      phone_number,
      email,
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
      picture: picture ? picture.buffer : null,
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
 *       400:
 *         description: Validation error (e.g., missing name).
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while creating the community.
 */