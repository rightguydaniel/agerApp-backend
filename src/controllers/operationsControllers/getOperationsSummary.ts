import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";
import Customers from "../../models/Customers";
import RestockHistory from "../../models/RestockHistory";
import Invoices from "../../models/Invoices";

const calculatePercentChange = (previous: number, current: number) => {
  if (previous === 0 && current === 0) {
    return 0;
  }
  if (previous === 0) {
    return 100;
  }
  return ((current - previous) / previous) * 100;
};

export const getOperationsSummary = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;

  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const [
      totalProducts,
      totalCustomers,
      currentMonthRestocks,
      previousMonthRestocks,
      currentMonthInvoices,
      previousMonthInvoices,
    ] = await Promise.all([
      Products.count({ where: { owner_id: userId } }),
      Customers.count({ where: { owner_id: userId } }),
      RestockHistory.count({
        where: {
          owner_id: userId,
          createdAt: { [Op.gte]: currentMonthStart, [Op.lt]: nextMonthStart },
        },
      }),
      RestockHistory.count({
        where: {
          owner_id: userId,
          createdAt: { [Op.gte]: previousMonthStart, [Op.lt]: currentMonthStart },
        },
      }),
      Invoices.count({
        where: {
          owner_id: userId,
          createdAt: { [Op.gte]: currentMonthStart, [Op.lt]: nextMonthStart },
        },
      }),
      Invoices.count({
        where: {
          owner_id: userId,
          createdAt: { [Op.gte]: previousMonthStart, [Op.lt]: currentMonthStart },
        },
      }),
    ]);

    sendResponse(response, 200, "Operations summary fetched", {
      totalProducts,
      totalCustomers,
      restocksChangePercent: calculatePercentChange(
        previousMonthRestocks,
        currentMonthRestocks
      ),
      invoicesChangePercent: calculatePercentChange(
        previousMonthInvoices,
        currentMonthInvoices
      ),
    });
    return;
  } catch (error: any) {
    console.error("Error in getOperationsSummary:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /operations/summary:
 *   get:
 *     summary: Get operations summary
 *     description: Returns totals and month-over-month percentage changes for restocks and invoices.
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operations summary fetched.
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
 *                   example: Operations summary fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                       example: 42
 *                     totalCustomers:
 *                       type: integer
 *                       example: 15
 *                     restocksChangePercent:
 *                       type: number
 *                       example: 25
 *                     invoicesChangePercent:
 *                       type: number
 *                       example: -10
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
 *         description: Server error while fetching operations summary.
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
