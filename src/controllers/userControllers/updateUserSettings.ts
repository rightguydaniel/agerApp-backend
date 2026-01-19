import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import UserSettings from "../../models/UserSettings";

export const updateUserSettings = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const { currency, notification, taxes_rate, taxes_enabled, language } =
    request.body as {
      currency?: string;
      notification?: boolean;
      taxes_rate?: number;
      taxes_enabled?: boolean;
      language?: string;
    };

  try {
    const existing = await UserSettings.findOne({
      where: { user_id: userId },
    });

    const hasAnyField =
      currency !== undefined ||
      notification !== undefined ||
      taxes_rate !== undefined ||
      taxes_enabled !== undefined ||
      language !== undefined;

    if (!hasAnyField) {
      sendResponse(response, 400, "No settings fields provided");
      return;
    }

    const settings = existing
      ? await existing.update({
          currency: currency ?? existing.currency,
          notification: notification ?? existing.notification,
          taxes_rate: taxes_rate ?? existing.taxes_rate,
          taxes_enabled: taxes_enabled ?? existing.taxes_enabled,
          language: language ?? existing.language,
        })
      : await UserSettings.create({
          user_id: userId,
          currency: currency ?? null,
          notification: notification ?? true,
          taxes_rate: taxes_rate ?? null,
          taxes_enabled: taxes_enabled ?? false,
          language: language ?? null,
        });

    sendResponse(response, 200, "User settings updated", settings);
    return;
  } catch (error: any) {
    console.error("Error in updateUserSettings:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/settings:
 *   put:
 *     summary: Add or update user settings
 *     description: Adds or updates settings for the authenticated user.
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
 *             properties:
 *               currency:
 *                 type: string
 *                 example: NGN
 *               notification:
 *                 type: boolean
 *                 example: true
 *               taxes_rate:
 *                 type: number
 *                 example: 7.5
 *               taxes_enabled:
 *                 type: boolean
 *                 example: true
 *               language:
 *                 type: string
 *                 example: en
 *     responses:
 *       200:
 *         description: User settings updated.
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
 *                   example: User settings updated
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     user_id:
 *                       type: string
 *                       example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                     currency:
 *                       type: string
 *                       nullable: true
 *                       example: NGN
 *                     notification:
 *                       type: boolean
 *                       example: true
 *                     taxes_rate:
 *                       type: number
 *                       nullable: true
 *                       example: 7.5
 *                     taxes_enabled:
 *                       type: boolean
 *                       example: true
 *                     language:
 *                       type: string
 *                       nullable: true
 *                       example: en
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Validation error.
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
 *                   example: No settings fields provided
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
 *         description: Server error while updating settings.
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
