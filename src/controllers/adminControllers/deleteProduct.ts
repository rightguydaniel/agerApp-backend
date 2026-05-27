import { Request, Response } from "express";
import Products from "../../models/Products";
import RestockHistory from "../../models/RestockHistory";
import sendResponse from "../../utils/http/sendResponse";

export const deleteProduct = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    if (!id) {
      sendResponse(response, 400, "Product ID is required");
      return;
    }

    const product = await Products.findByPk(id);

    if (!product) {
      sendResponse(response, 404, "Product not found");
      return;
    }

    // Delete restock history first
    await RestockHistory.destroy({
      where: { product_id: id },
    });

    // Delete the product
    await Products.destroy({
      where: { id },
    });

    sendResponse(
      response,
      200,
      "Product and its history deleted successfully",
      null
    );
  } catch (error: any) {
    console.error("Error deleting product", error.message);
    sendResponse(response, 500, "Failed to delete product", error.message);
  }
};

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Permanently deletes a product and all its restock history. Requires admin authentication.
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
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       400:
 *         description: Missing product ID.
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Server error while deleting product.
 */
