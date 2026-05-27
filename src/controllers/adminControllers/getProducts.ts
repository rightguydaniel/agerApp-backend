import { Request, Response } from "express";
import { Op } from "sequelize";
import Products from "../../models/Products";
import sendResponse from "../../utils/http/sendResponse";

export const getProducts = async (request: Request, response: Response) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "20", 10);
    const keyword = ((request.query.keyword as string) || "").trim();
    const offset = (page - 1) * perPage;

    const whereClause: any = {};
    if (keyword) {
      whereClause[Op.or] = [{ name: { [Op.like]: `%${keyword}%` } }];
    }

    const { rows, count } = await Products.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Products retrieved", {
      items: rows,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching products", error.message);
    sendResponse(response, 500, "Failed to fetch products", error.message);
  }
};

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: List all products
 *     description: Returns paginated list of all products with optional keyword search. Requires admin authentication.
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
 *         description: Successfully retrieved products.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       500:
 *         description: Server error while fetching products.
 */
