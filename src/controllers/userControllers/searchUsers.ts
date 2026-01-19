import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";

export const searchUsers = async (request: JwtPayload, response: Response) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "10", 10);
    const keyword = ((request.query.keyword as string) || "").trim();

    const offset = (page - 1) * perPage;
    const whereClause = keyword
      ? {
          [Op.or]: [
            { full_name: { [Op.like]: `%${keyword}%` } },
            { email: { [Op.like]: `%${keyword}%` } },
            { userName: { [Op.like]: `%${keyword}%` } },
            { phone: { [Op.like]: `%${keyword}%` } },
          ],
        }
      : undefined;

    const { rows, count } = await Users.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Users fetched", {
      items: rows,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages,
      },
    });
    return;
  } catch (error: any) {
    console.error("Error in searchUsers:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Returns a paginated list of users filtered by a keyword.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to search by name, email, username, or phone.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: perPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page.
 *     responses:
 *       200:
 *         description: Users fetched.
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
 *                   example: Users fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                           full_name:
 *                             type: string
 *                             example: Jane Doe
 *                           userName:
 *                             type: string
 *                             nullable: true
 *                             example: janedoe
 *                           email:
 *                             type: string
 *                             example: user@example.com
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                             example: "+2348012345678"
 *                           picture:
 *                             type: string
 *                             nullable: true
 *                             example: https://example.com/avatar.png
 *                           role:
 *                             type: string
 *                             example: user
 *                           socials:
 *                             type: array
 *                             nullable: true
 *                             items:
 *                               type: object
 *                               properties:
 *                                 social:
 *                                   type: string
 *                                   enum: [INSTAGRAM, FACEBOOK, LINKEDIN, DISCORD, TELEGRAM, WHATSAPP]
 *                                 link:
 *                                   type: string
 *                             example:
 *                               - social: INSTAGRAM
 *                                 link: https://instagram.com/abc111
 *                           country:
 *                             type: string
 *                             nullable: true
 *                             example: Nigeria
 *                           business_name:
 *                             type: string
 *                             nullable: true
 *                             example: CPlynk Ltd
 *                           business_category:
 *                             type: string
 *                             nullable: true
 *                             example: Logistics
 *                           isVerified:
 *                             type: boolean
 *                             example: true
 *                           isBlocked:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-15T10:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-16T12:00:00.000Z
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         perPage:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 3
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
 *         description: Server error while searching users.
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
