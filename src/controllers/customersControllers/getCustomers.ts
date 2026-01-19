import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";

export const getCustomers = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;

  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "10", 10);
    const keyword = ((request.query.keyword as string) || "").trim();

    const offset = (page - 1) * perPage;
    const whereClause: any = { owner_id: userId };

    if (keyword) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
        { phone_number: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { rows, count } = await Customers.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Customers fetched", {
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
    console.error("Error in getCustomers:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get customers
 *     description: Returns all customers for the authenticated user.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to search by name, email, phone, or location.
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
 *         description: Number of customers per page.
 *     responses:
 *       200:
 *         description: Customers fetched.
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
 *                   example: Customers fetched
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
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           phone_number:
 *                             type: string
 *                             example: "+2348012345678"
 *                           location:
 *                             type: string
 *                             example: Lagos
 *                           email:
 *                             type: string
 *                             example: john@example.com
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
 *         description: Server error while fetching customers.
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
