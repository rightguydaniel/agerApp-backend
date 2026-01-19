import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";

export const updateBusinessName = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const { business_name } = request.body as { business_name?: string };

  try {
    if (!business_name) {
      sendResponse(response, 400, "business_name is required");
      return;
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    await user.update({ business_name });

    const safeUser = await Users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    sendResponse(response, 200, "Business name updated", safeUser);
    return;
  } catch (error: any) {
    console.error("Error in updateBusinessName:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/business-name:
 *   patch:
 *     summary: Update business name
 *     description: Updates the authenticated user's business name.
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
 *               - business_name
 *             properties:
 *               business_name:
 *                 type: string
 *                 example: CPlynk Ltd
 *     responses:
 *       200:
 *         description: Business name updated.
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
 *                   example: Business name updated
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
 *                     userName:
 *                       type: string
 *                       nullable: true
 *                       example: janedoe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+2348012345678"
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatar.png
 *                     role:
 *                       type: string
 *                       example: user
 *                     socials:
 *                       type: array
 *                       nullable: true
 *                       items:
 *                         type: object
 *                         properties:
 *                           social:
 *                             type: string
 *                             enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                           link:
 *                             type: string
 *                       example:
 *                         - social: INSTAGRAM
 *                           link: https://instagram.com/abc111
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: Nigeria
 *                     state:
 *                       type: string
 *                       nullable: true
 *                       example: Lagos
 *                     address:
 *                       type: string
 *                       nullable: true
 *                       example: 10 Main Street, Ikeja
 *                     business_name:
 *                       type: string
 *                       nullable: true
 *                       example: CPlynk Ltd
 *                     business_category:
 *                       type: string
 *                       nullable: true
 *                       example: Logistics
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isBlocked:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Validation error or user not found.
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
 *                   example: business_name is required
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
 *         description: Server error while updating business name.
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
