import { Request, Response } from "express";
import Products from "../../models/Products";
import sendResponse from "../../utils/http/sendResponse";

export const updateProduct = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { name, price, quantity, measurement, quantity_type, expiry_date, restock_alert } =
      request.body;

    if (!id) {
      sendResponse(response, 400, "Product ID is required");
      return;
    }

    const product = await Products.findByPk(id);

    if (!product) {
      sendResponse(response, 404, "Product not found");
      return;
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (measurement !== undefined) updateData.measurement = measurement;
    if (quantity_type !== undefined) updateData.quantity_type = quantity_type;
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
    if (restock_alert !== undefined) updateData.restock_alert = restock_alert;

    await product.update(updateData);

    const updatedProduct = await Products.findByPk(id);

    sendResponse(response, 200, "Product updated successfully", updatedProduct);
  } catch (error: any) {
    console.error("Error updating product", error.message);
    sendResponse(response, 500, "Failed to update product", error.message);
  }
};

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates product details. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               measurement:
 *                 type: string
 *               quantity_type:
 *                 type: string
 *               expiry_date:
 *                 type: string
 *               restock_alert:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       400:
 *         description: Missing product ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Server error while updating product.
 */
