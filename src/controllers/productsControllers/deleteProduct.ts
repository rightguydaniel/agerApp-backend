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
 * /products/delete/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Removes the specified product owned by the authenticated user from the inventory.
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
 *         description: Identifier of the product to delete.
 *     responses:
 *       200:
 *         description: Product deleted successfully.
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
 *                   example: Product Deleted
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Product ID missing or product not found.
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
 *                   example: Product not found
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
 *         description: Server error while deleting the product.
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
