import { Response } from "express";
import fs from "fs";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import {
  buildUserImageUrl,
  resolveLocalUserImagePath,
} from "../../utils/services/media";

export const updateUserPhoto = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const picture = request.file as Express.Multer.File | undefined;

  try {
    if (!picture) {
      sendResponse(response, 400, "picture file is required");
      return;
    }

    const user = await Users.findOne({ where: { id: userId } });

    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    const removeExistingPictureFromDisk = () => {
      if (!user.picture) {
        return;
      }
      const isHostedImage = !user.picture.includes("/uploads/users/");
      if (isHostedImage) {
        return;
      }
      const existingPath = resolveLocalUserImagePath(user.picture);
      if (fs.existsSync(existingPath)) {
        try {
          fs.unlinkSync(existingPath);
        } catch (unlinkError) {
          console.warn("Failed to remove user picture", unlinkError);
        }
      }
    };

    removeExistingPictureFromDisk();

    const nextPicture = buildUserImageUrl(picture.filename);
    await user.update({ picture: nextPicture });

    const { password: _password, ...safeUser } = user.get({ plain: true });

    sendResponse(response, 200, "User photo updated", safeUser);
    return;
  } catch (error: any) {
    console.error("Error in updateUserPhoto:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/photo:
 *   patch:
 *     summary: Update user photo
 *     description: Uploads a new profile photo for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - picture
 *             properties:
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User photo updated.
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
 *                   example: User photo updated
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     full_name:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                       example: http://localhost:3030/uploads/users/1700000000000-123456789.png
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Missing picture file or user not found.
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
 *                   example: picture file is required
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
 *         description: Internal server error.
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
