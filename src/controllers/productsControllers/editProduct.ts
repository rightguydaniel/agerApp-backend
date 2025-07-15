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
 * /products/{id}:
 *   put:
 *     summary: Edit an existing product
 *     description: Updates the details of a product owned by the authenticated user.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to be updated.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: The updated product details.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the product.
 *             measurement:
 *               type: string
 *               description: The measurement unit of the product.
 *             quantity:
 *               type: number
 *               description: The quantity of the product.
 *             quantity_type:
 *               type: string
 *               description: The type of quantity (e.g., kg, liters).
 *             price:
 *               type: number
 *               description: The price of the product.
 *             expiry:
 *               type: string
 *               format: date
 *               description: The expiry date of the product.
 *             restock_alert:
 *               type: number
 *               description: The threshold for restock alerts.
 *     responses:
 *       200:
 *         description: Product successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Updated
 *       400:
 *         description: Bad request, such as missing product ID or product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Id is missing
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
