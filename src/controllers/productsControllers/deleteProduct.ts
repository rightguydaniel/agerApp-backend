import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";

export const deleteProduct = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const productId = request.params.id;
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
    await Products.destroy({
      where: { owner_id: userId, id: productId },
    });
    sendResponse(response, 200, "Product Deleted");
    return;
  } catch (error: any) {
    console.log("Error in deleteProduct:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a product owned by the authenticated user based on the provided product ID.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Deleted
 *       400:
 *         description: Bad request due to missing or invalid product ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Id is missing
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
