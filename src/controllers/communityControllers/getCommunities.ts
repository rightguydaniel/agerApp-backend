import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Communities from "../../models/Communities";

export const getCommunities = async (
  request: JwtPayload,
  response: Response
) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "10", 10);
    const keyword = (request.query.keyword as string) || "";
    const order = ((request.query.order as string) || "desc").toLowerCase();

    const offset = (page - 1) * perPage;

    const whereClause: any = {};
    if (keyword) {
      whereClause.name = { [Op.like]: `%${keyword}%` };
    }

    const { rows, count } = await Communities.findAndCountAll({
      where: whereClause,
      order: [["createdAt", order === "asc" ? "ASC" : "DESC"]],
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Communities fetched", {
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
    console.error("Error in getCommunities:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /communities:
 *   get:
 *     summary: Get communities
 *     description: Returns a paginated list of communities with optional keyword search by name.
 *     tags:
 *       - Communities
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of communities per page.
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to search communities by name (partial match).
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order by creation date (`asc` or `desc`).
 *     responses:
 *       200:
 *         description: List of communities with pagination metadata.
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
 *                   example: Communities fetched
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
 *                           name:
 *                             type: string
 *                             example: Lagos Entrepreneurs
 *                           state:
 *                             type: string
 *                             nullable: true
 *                             example: Lagos
 *                           country:
 *                             type: string
 *                             nullable: true
 *                             example: Nigeria
 *                           description:
 *                             type: string
 *                             nullable: true
 *                             example: A community for founders and builders.
 *                           whatsapp_link:
 *                             type: string
 *                             nullable: true
 *                             example: https://chat.whatsapp.com/example
 *                           phone_number:
 *                             type: string
 *                             nullable: true
 *                             example: "+2348012345678"
 *                           email:
 *                             type: string
 *                             nullable: true
 *                             example: hello@cplynk.com
 *                           instagram_link:
 *                             type: string
 *                             nullable: true
 *                             example: https://instagram.com/cplynk
 *                           facebook_link:
 *                             type: string
 *                             nullable: true
 *                             example: https://facebook.com/cplynk
 *                           created_by:
 *                             type: string
 *                             example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                           picture:
 *                             type: string
 *                             nullable: true
 *                             example: http://localhost:3030/uploads/communities/1700000000000-123456789.png
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
 *       500:
 *         description: Server error while fetching communities.
 */
