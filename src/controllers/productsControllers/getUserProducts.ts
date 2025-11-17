import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";

export const getUserProducts = async (
  request: JwtPayload,
  response: Response
) => {
  try {
    const userId = request.user.id;

    const page = parseInt((request.query.page as string) || "1", 10);
    const limit = parseInt((request.query.limit as string) || "10", 10);
    const search = (request.query.name as string) || "";
    const order = ((request.query.order as string) || "desc").toLowerCase();

    const offset = (page - 1) * limit;

    const whereClause: any = { owner_id: userId };
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await Products.findAndCountAll({
      where: whereClause,
      order: [["createdAt", order === "asc" ? "ASC" : "DESC"]],
      attributes: { exclude: ["image"] },
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit) || 1;

    sendResponse(response, 200, "User products fetched", {
      items: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    });
    return;
  } catch (error: any) {
    console.error("Error fetching user products:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/my:
 *   get:
 *     summary: Get all products for the authenticated user
 *     description: Returns a paginated list of products owned by the currently authenticated user, with optional name filtering.
 *     tags:
 *       - Products
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
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter products by name (partial match, case-insensitive depending on DB collation).
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
 *         description: List of products for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User products fetched
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
 *                           owner_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           measurement:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           expiry_date:
 *                             type: string
 *                             format: date-time
 *                           restock_alert:
 *                             type: number
 *                           number_of_restocks:
 *                             type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while creating the product.
 */
