import { Request, Response } from "express";
import { Op } from "sequelize";
import Communities from "../../models/Communities";
import sendResponse from "../../utils/http/sendResponse";

export const getCommunities = async (request: Request, response: Response) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "20", 10);
    const keyword = ((request.query.keyword as string) || "").trim();
    const offset = (page - 1) * perPage;

    const whereClause: any = {};
    if (keyword) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { state: { [Op.like]: `%${keyword}%` } },
        { country: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { rows, count } = await Communities.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Communities retrieved", {
      items: rows,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching communities", error.message);
    sendResponse(response, 500, "Failed to fetch communities", error.message);
  }
};

/**
 * @swagger
 * /admin/communities:
 *   get:
 *     summary: List all communities
 *     description: Returns paginated list of all communities with optional keyword search. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved communities.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       500:
 *         description: Server error while fetching communities.
 */
