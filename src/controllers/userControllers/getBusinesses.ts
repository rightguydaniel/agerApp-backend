import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";

export const getBusinesses = async (
  request: JwtPayload,
  response: Response
) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "10", 10);
    const keyword = ((request.query.keyword as string) || "").trim();
    const order = ((request.query.order as string) || "desc").toLowerCase();

    const offset = (page - 1) * perPage;
    const whereClause: any = {
      business_name: { [Op.ne]: null },
    };

    if (keyword) {
      whereClause.business_name = { [Op.like]: `%${keyword}%` };
    }

    const { rows, count } = await Users.findAndCountAll({
      where: whereClause,
      order: [["createdAt", order === "asc" ? "ASC" : "DESC"]],
      attributes: { exclude: ["password"] },
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Businesses fetched", {
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
    console.error("Error in getBusinesses:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /users/businesses:
 *   get:
 *     summary: Get businesses
 *     description: Returns a paginated list of users with business profiles.
 *     tags:
 *       - Users
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
 *         description: Number of businesses per page.
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to search businesses by name.
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
 *         description: Businesses fetched.
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
 *                   example: Businesses fetched
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
 *                           full_name:
 *                             type: string
 *                           userName:
 *                             type: string
 *                             nullable: true
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           picture:
 *                             type: string
 *                             nullable: true
 *                           role:
 *                             type: string
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
 *                           country:
 *                             type: string
 *                             nullable: true
 *                           state:
 *                             type: string
 *                             nullable: true
 *                           address:
 *                             type: string
 *                             nullable: true
 *                           business_name:
 *                             type: string
 *                             nullable: true
 *                           business_category:
 *                             type: string
 *                             nullable: true
 *                           isVerified:
 *                             type: boolean
 *                           isBlocked:
 *                             type: string
 *                             nullable: true
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
 *         description: Server error while fetching businesses.
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
