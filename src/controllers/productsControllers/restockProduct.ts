import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";
import RestockHistory from "../../models/RestockHistory";

export const restockProduct = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const productId = request.params.id;
  const { quantity } = request.body;

  try {
    if (!productId) {
      sendResponse(response, 400, "Product Id is missing");
      return;
    }

    if (!quantity || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      sendResponse(response, 400, "Invalid restock quantity");
      return;
    }

    const product = await Products.findOne({
      where: { owner_id: userId, id: productId },
    });

    if (!product) {
      sendResponse(response, 400, "Product not found");
      return;
    }

    const newQuantity = Number(product.quantity) + Number(quantity);
    const newRestockCount = Number(product.number_of_restocks || 0) + 1;

    await Products.update(
      {
        quantity: newQuantity,
        number_of_restocks: newRestockCount,
      },
      { where: { owner_id: userId, id: productId } }
    );

    await RestockHistory.create({
      product_id: productId,
      owner_id: userId,
      restocked_by: userId,
      quantity: Number(quantity),
    });

    sendResponse(response, 200, "Product restocked successfully");
    return;
  } catch (error: any) {
    console.log("Error in restockProduct:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/restock/{id}:
 *   post:
 *     summary: Restock a product
 *     description: Increases the stock quantity of a product owned by the authenticated user and increments the restock count.
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
 *         description: Identifier of the product to restock.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Amount to add to the current product quantity.
 *     responses:
 *       200:
 *         description: Product restocked successfully.
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
 *                   example: Product restocked successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Product ID missing, product not found, or invalid quantity.
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
 *                   example: Invalid restock quantity
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
