import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Users, { userSocial } from "../../models/Users";

export const addUserSocial = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const { social, link } = request.body as {
    social?: string;
    link?: string;
  };

  try {
    if (!social || !link) {
      sendResponse(response, 400, "social and link are required");
      return;
    }

    const normalizedSocial = social.toUpperCase();
    if (!Object.values(userSocial).includes(normalizedSocial as userSocial)) {
      sendResponse(response, 400, "Invalid social platform");
      return;
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    let existingSocials: { social: userSocial; link: string }[] = [];
    if (Array.isArray(user.socials)) {
      existingSocials = user.socials;
    } else if (user.socials && typeof user.socials === "object") {
      const socialsValue = user.socials as Record<string, any>;
      if ("social" in socialsValue && "link" in socialsValue) {
        const socialValue = String(socialsValue.social || "").toUpperCase();
        if (Object.values(userSocial).includes(socialValue as userSocial)) {
          existingSocials = [
            {
              social: socialValue as userSocial,
              link: String(socialsValue.link || ""),
            },
          ];
        }
      } else {
        existingSocials = Object.entries(socialsValue)
          .map(([socialKey, socialLink]) => {
            const socialValue = String(socialKey || "").toUpperCase();
            if (!Object.values(userSocial).includes(socialValue as userSocial)) {
              return null;
            }
            return {
              social: socialValue as userSocial,
              link: String(socialLink || ""),
            };
          })
          .filter(Boolean) as { social: userSocial; link: string }[];
      }
    }

    const nextSocials = [
      ...existingSocials.filter(
        (entry) => entry.social !== (normalizedSocial as userSocial)
      ),
      { social: normalizedSocial as userSocial, link },
    ];

    await user.update({ socials: nextSocials });

    const safeUser = await Users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    sendResponse(response, 200, "Social profile updated", safeUser);
    return;
  } catch (error: any) {
    console.error("Error in addUserSocial:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/socials:
 *   post:
 *     summary: Add or update a social profile link
 *     description: Adds or updates a social profile link for the authenticated user.
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
 *               - social
 *               - link
 *             properties:
 *               social:
 *                 type: string
 *                 enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                 description: Social platform to add/update.
 *               link:
 *                 type: string
 *                 description: Profile link for the selected platform.
 *                 example: https://instagram.com/abc111
 *     responses:
 *       200:
 *         description: Social profile updated.
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
 *                   example: Social profile updated
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
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: Nigeria
 *                     business_name:
 *                       type: string
 *                       nullable: true
 *                       example: CPlynk Ltd
 *                     business_category:
 *                       type: string
 *                       nullable: true
 *                       example: Logistics
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
 *                   example: Invalid social platform
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
 *         description: Server error while updating social profiles.
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
