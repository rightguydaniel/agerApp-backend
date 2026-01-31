import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import RestockHistory from "../../models/RestockHistory";
import Products from "../../models/Products";
import { Op } from "sequelize";

export const getRestockHistory = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;

  try {
    const history = await RestockHistory.findAll({
      where: { owner_id: userId },
      order: [["createdAt", "DESC"]],
    });

    const productIds = Array.from(
      new Set(history.map((item) => item.product_id).filter(Boolean))
    );

    const products = productIds.length
      ? await Products.findAll({
          where: { id: { [Op.in]: productIds }, owner_id: userId },
          attributes: ["id", "name", "measurement"],
        })
      : [];

    const productLookup = new Map(
      products.map((product) => [
        product.id,
        { name: product.name, measurement: product.measurement },
      ])
    );

    const responseItems = history.map((item) => {
      const plainItem = item.get({ plain: true }) as any;
      const productMeta = productLookup.get(plainItem.product_id);
      return {
        ...plainItem,
        product_name: productMeta?.name ?? null,
        product_measurement: productMeta?.measurement ?? null,
      };
    });

    sendResponse(response, 200, "Restock history fetched", responseItems);
    return;
  } catch (error: any) {
    console.error("Error in getRestockHistory:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/restock-history:
 *   get:
 *     summary: Get restock history
 *     description: Returns the authenticated user's restock history.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restock history fetched.
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
 *                   example: Restock history fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                       product_id:
 *                         type: string
 *                         example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                       owner_id:
 *                         type: string
 *                         example: 1a2b3c4d-5e6f-7890-abcd-ef1234567890
 *                       restocked_by:
 *                         type: string
 *                         example: 1a2b3c4d-5e6f-7890-abcd-ef1234567890
 *                       quantity:
 *                         type: number
 *                         example: 5
 *                       product_name:
 *                         type: string
 *                         nullable: true
 *                         example: Maize
 *                       product_measurement:
 *                         type: string
 *                         nullable: true
 *                         example: bags
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:00:00.000Z
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
 *         description: Server error while fetching restock history.
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
