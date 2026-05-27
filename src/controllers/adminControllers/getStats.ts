import { Request, Response } from "express";
import { Op } from "sequelize";
import Users from "../../models/Users";
import BlogPost from "../../models/BlogPost";
import Communities from "../../models/Communities";
import Products from "../../models/Products";
import Invoices from "../../models/Invoices";
import sendResponse from "../../utils/http/sendResponse";

export const getStats = async (request: Request, response: Response) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalUsers,
      verifiedUsers,
      blockedUsers,
      newUsersThisMonth,
      totalBlogs,
      publishedBlogs,
      totalCommunities,
      totalProducts,
      totalInvoices,
    ] = await Promise.all([
      Users.count(),
      Users.count({ where: { isVerified: true } }),
      Users.count({ where: { isBlocked: { [Op.ne]: null } } }),
      Users.count({
        where: { createdAt: { [Op.gte]: currentMonth } } as any,
      }),
      BlogPost.count(),
      BlogPost.count({ where: { isPublished: true } }),
      Communities.count(),
      Products.count(),
      Invoices.count(),
    ]);

    const stats = {
      totalUsers,
      verifiedUsers,
      blockedUsers,
      newUsersThisMonth,
      totalBlogs,
      publishedBlogs,
      totalCommunities,
      totalProducts,
      totalInvoices,
    };

    sendResponse(response, 200, "Platform stats retrieved", stats);
  } catch (error: any) {
    console.error("Error fetching admin stats", error.message);
    sendResponse(response, 500, "Failed to fetch platform stats", error.message);
  }
};

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     description: Returns aggregated counts of users, blogs, communities, products, and invoices. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved platform statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     verifiedUsers:
 *                       type: integer
 *                     blockedUsers:
 *                       type: integer
 *                     newUsersThisMonth:
 *                       type: integer
 *                     totalBlogs:
 *                       type: integer
 *                     publishedBlogs:
 *                       type: integer
 *                     totalCommunities:
 *                       type: integer
 *                     totalProducts:
 *                       type: integer
 *                     totalInvoices:
 *                       type: integer
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       500:
 *         description: Server error while fetching stats.
 */
