import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";

export const editProduct = async (request: JwtPayload, response: Response) => {
  const userId = request.user.id;
  const productId = request.params.id;
  const {
    name,
    measurement,
    quantity,
    quantity_type,
    price,
    expiry,
    restock_alert,
  } = request.body;
  try {
    if (!productId) {
      sendResponse(response, 400, "Product Id is missing");
      return;
    }
    const product = await Products.findOne({
      where: { owner_id: userId, id: productId },
    });
    if (!product) {
      sendResponse(response, 400, "Product not found");
      return;
    }
    const updateProduct = await Products.update(
      {
        name: name ? name : product.name,
        measurement: measurement ? measurement : product.measurement,
        quantity: quantity ? quantity : product.quantity,
        quantity_type: quantity_type ? quantity_type : product.quantity_type,
        price: price ? price : product.price,
        expiry_date: expiry ? expiry : product.expiry_date,
        restock_alert: restock_alert ? restock_alert : product.restock_alert,
      },
      { where: { owner_id: userId, id: productId } }
    );
    sendResponse(response, 200, "Product Updated");
    return;
  } catch (error: any) {
    console.log("Error in editProduct", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/edit/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates details of the specified product owned by the authenticated user.
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
 *         description: Identifier of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               measurement:
 *                 type: string
 *               quantity:
 *                 type: number
 *               quantity_type:
 *                 type: string
 *               price:
 *                 type: number
 *               expiry:
 *                 type: string
 *                 format: date
 *               restock_alert:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       400:
 *         description: Product ID missing or product not found.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while updating the product.
 */
