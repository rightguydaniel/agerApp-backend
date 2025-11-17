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
      attributes: { exclude: ["picture"] },
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
 *                 message:
 *                   type: string
 *                   example: Communities fetched
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
 *                           name:
 *                             type: string
 *                           state:
 *                             type: string
 *                           country:
 *                             type: string
 *                           description:
 *                             type: string
 *                           whatsapp_link:
 *                             type: string
 *                           phone_number:
 *                             type: string
 *                           email:
 *                             type: string
 *                           instagram_link:
 *                             type: string
 *                           facebook_link:
 *                             type: string
 *                           created_by:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         perPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while fetching communities.
 */
