import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Invoices from "../../models/Invoices";
import Products from "../../models/Products";
import { database } from "../../configs/database/database";

export const deleteInvoice = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const invoiceId = request.params.id;

  try {
    if (!invoiceId) {
      sendResponse(response, 400, "Invoice Id is missing");
      return;
    }

    const invoice = await Invoices.findOne({
      where: { id: invoiceId, owner_id: userId },
    });

    if (!invoice) {
      sendResponse(response, 404, "Invoice not found");
      return;
    }

    const badRequest = (message: string): never => {
      const error = new Error(message) as Error & { status?: number };
      error.status = 400;
      throw error;
    };

    await database.transaction(async (transaction) => {
      const productQuantities = new Map<string, number>();

      for (const item of invoice.products ?? []) {
        if (!item?.product_id) {
          continue;
        }
        const qty = Number(item.quantity);
        if (Number.isNaN(qty) || qty <= 0) {
          badRequest("Invalid product quantity");
        }

        productQuantities.set(
          item.product_id,
          (productQuantities.get(item.product_id) ?? 0) + qty
        );
      }

      const productIds = Array.from(productQuantities.keys());

      if (productIds.length > 0) {
        const dbProducts = await Products.findAll({
          where: { id: productIds, owner_id: userId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (dbProducts.length !== productIds.length) {
          badRequest("One or more products not found");
        }

        const productsById = new Map(
          dbProducts.map((product) => [product.id, product])
        );

        for (const [productId, qty] of productQuantities.entries()) {
          const product = productsById.get(productId);
          if (!product) {
            badRequest("One or more products not found");
          }

          await product!.update(
            { quantity: Number(product!.quantity) + qty },
            { transaction }
          );
        }
      }

      await invoice.destroy({ transaction });
    });

    sendResponse(response, 200, "Invoice deleted", { invoice });
    return;
  } catch (error: any) {
    console.error("Error in deleteInvoice:", error.message);
    if (error?.status === 400) {
      sendResponse(response, 400, error.message);
      return;
    }
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     description: Deletes an invoice for the authenticated user and returns its products to stock.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice identifier.
 *     responses:
 *       200:
 *         description: Invoice deleted.
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
 *                   example: Invoice deleted
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Validation error.
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
 *                   example: Invalid product quantity
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
 *       404:
 *         description: Invoice not found.
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
 *                   example: Invoice not found
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Server error while deleting invoice.
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
