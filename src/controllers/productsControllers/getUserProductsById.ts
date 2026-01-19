import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";

export const getUserProductsById = async (
  request: JwtPayload,
  response: Response
) => {
  const ownerId = request.params.id;

  try {
    if (!ownerId) {
      sendResponse(response, 400, "User Id is missing");
      return;
    }

    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "10", 10);
    const keyword = ((request.query.keyword as string) || "").trim();
    const offset = (page - 1) * perPage;

    const whereClause: any = { owner_id: ownerId };
    if (keyword) {
      whereClause.name = { [Op.like]: `%${keyword}%` };
    }

    const { rows, count } = await Products.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "User products fetched", {
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
    console.error("Error fetching user products:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/user/{id}:
 *   get:
 *     summary: Get products for a user
 *     description: Returns all products for a specific user.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User identifier.
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to search products by name.
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
 *         description: Number of products per page.
 *     responses:
 *       200:
 *         description: User products fetched.
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
 *                           owner_id:
 *                             type: string
 *                           image:
 *                             type: array
 *                             nullable: true
 *                             items:
 *                               type: string
 *                           name:
 *                             type: string
 *                           measurement:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           quantity_type:
 *                             type: string
 *                           price:
 *                             type: number
 *                           expiry_date:
 *                             type: string
 *                             format: date-time
 *                           restock_alert:
 *                             type: number
 *                           number_of_restocks:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 *       400:
 *         description: User Id missing.
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
 *                   example: User Id is missing
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
 *         description: Server error while fetching user products.
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
