import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Op, fn, literal } from "sequelize";
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

export const getStoreStats = async (request: JwtPayload, response: Response) => {
  const userId = request.user.id;
  const now = new Date();
  const year = parseInt(
    (request.query.year as string) || `${now.getFullYear()}`,
    10
  );
  const month = parseInt(
    (request.query.month as string) || `${now.getMonth() + 1}`,
    10
  );

  if (Number.isNaN(month) || month < 1 || month > 12) {
    sendResponse(response, 400, "Invalid month. Use 1-12.");
    return;
  }

  try {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    const [monthlyCustomers, productsWorthRows] = await Promise.all([
      Invoices.count({
        where: {
          owner_id: userId,
          createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
        },
      }),
      Products.findAll({
        where: { owner_id: userId },
        attributes: [
          [
            fn("SUM", literal("IFNULL(price, 0) * IFNULL(quantity, 0)")),
            "totalWorth",
          ],
        ],
      }),
    ]);

    const storeNetWorth =
      Number(productsWorthRows[0]?.get("totalWorth") || 0) || 0;

    sendResponse(response, 200, "Store stats fetched", {
      year,
      month,
      monthLabel: monthLabels[month - 1],
      monthlyCustomers,
      storeNetWorth,
    });
    return;
  } catch (error: any) {
    console.error("Error in getStoreStats:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /analytics/store:
 *   get:
 *     summary: Get store net worth and monthly customers
 *     description: Returns store net worth (sum of product price * quantity) and total invoices created in a month.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month number (1-12). Defaults to current month.
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year for the month (defaults to current year).
 *     responses:
 *       200:
 *         description: Store stats fetched.
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
 *                   example: Store stats fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2026
 *                     month:
 *                       type: integer
 *                       example: 1
 *                     monthLabel:
 *                       type: string
 *                       example: January
 *                     monthlyCustomers:
 *                       type: integer
 *                       example: 24
 *                     storeNetWorth:
 *                       type: number
 *                       example: 120000
 *       400:
 *         description: Invalid month value.
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
 *                   example: Invalid month. Use 1-12.
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
 *         description: Server error while fetching store stats.
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
