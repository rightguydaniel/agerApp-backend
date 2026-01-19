import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op, fn, col, literal } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Invoices from "../../models/Invoices";
import Products from "../../models/Products";

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getInvoiceAnalytics = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const year = parseInt(
    (request.query.year as string) || `${new Date().getFullYear()}`,
    10
  );

  try {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const nextMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1
    );

    const [invoiceTotals, productsWorthRows, currentMonthInvoicesWorthRows] =
      await Promise.all([
        Invoices.findAll({
          where: {
            owner_id: userId,
            createdAt: { [Op.gte]: yearStart, [Op.lt]: yearEnd },
          },
          attributes: [
            [fn("MONTH", col("createdAt")), "month"],
            [fn("SUM", col("total")), "total"],
          ],
          group: [fn("MONTH", col("createdAt"))],
        }),
        Products.findAll({
          where: { owner_id: userId },
          attributes: [
            [
              fn(
                "SUM",
                literal("IFNULL(price, 0) * IFNULL(quantity, 0)")
              ),
              "totalWorth",
            ],
          ],
        }),
        Invoices.findAll({
          where: {
            owner_id: userId,
            createdAt: { [Op.gte]: currentMonthStart, [Op.lt]: nextMonthStart },
          },
          attributes: [[fn("SUM", col("total")), "totalWorth"]],
        }),
      ]);

    const monthTotals = monthLabels.map((_label, index) => {
      const match = invoiceTotals.find((row: any) => {
        const monthValue = Number(row.get("month"));
        return monthValue === index + 1;
      });
      const total = match ? Number(match.get("total") || 0) : 0;
      return total;
    });

    const productsWorth =
      Number(productsWorthRows[0]?.get("totalWorth") || 0) || 0;
    const currentMonthInvoicesWorth =
      Number(currentMonthInvoicesWorthRows[0]?.get("totalWorth") || 0) || 0;

    sendResponse(response, 200, "Invoice analytics fetched", {
      year,
      monthlyTotals: monthTotals.map((total, index) => ({
        month: monthLabels[index],
        total,
      })),
      productsWorth,
      currentMonthInvoicesWorth,
    });
    return;
  } catch (error: any) {
    console.error("Error in getInvoiceAnalytics:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /analytics/invoices:
 *   get:
 *     summary: Get invoice analytics
 *     description: Returns invoice totals per month for a year, products worth, and current month invoices worth.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year for the monthly breakdown (defaults to current year).
 *     responses:
 *       200:
 *         description: Invoice analytics fetched.
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
 *                   example: Invoice analytics fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     monthlyTotals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: January
 *                           total:
 *                             type: number
 *                             example: 25000
 *                     productsWorth:
 *                       type: number
 *                       example: 120000
 *                     currentMonthInvoicesWorth:
 *                       type: number
 *                       example: 35000
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
 *         description: Server error while fetching analytics.
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
