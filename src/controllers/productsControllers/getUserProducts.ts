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
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User products fetched
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
 *                           owner_id:
 *                             type: string
 *                             example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                           image:
 *                             type: array
 *                             nullable: true
 *                             items:
 *                               type: string
 *                             example:
 *                               - http://localhost:3030/uploads/products/1700000000000-123456789.png
 *                           name:
 *                             type: string
 *                             example: Fresh Apples
 *                           measurement:
 *                             type: string
 *                             nullable: true
 *                             example: kg
 *                           quantity:
 *                             type: number
 *                             example: 10
 *                           quantity_type:
 *                             type: string
 *                             nullable: true
 *                             example: crate
 *                           price:
 *                             type: number
 *                             example: 2500
 *                           expiry_date:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: 2024-12-31T00:00:00.000Z
 *                           restock_alert:
 *                             type: number
 *                             example: 2
 *                           number_of_restocks:
 *                             type: number
 *                             example: 1
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
 *                         limit:
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
 *         description: Server error while creating the product.
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
