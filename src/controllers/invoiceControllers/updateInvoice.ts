import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";
import Invoices from "../../models/Invoices";

export const updateInvoice = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const invoiceId = request.params.id;
  const {
    customer_id,
    products,
    narration,
    delivery_fees,
    auto_approve,
  } = request.body as {
    customer_id?: string;
    products?: Array<{
      product_id?: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    narration?: string;
    delivery_fees?: number;
    auto_approve?: boolean;
  };

  try {
    if (!invoiceId) {
      sendResponse(response, 400, "Invoice Id is missing");
      return;
    }

    const invoice = await Invoices.findOne({
      where: { id: invoiceId, owner_id: userId },
    });
    if (!invoice) {
      sendResponse(response, 400, "Invoice not found");
      return;
    }

    let nextCustomerId = invoice.customer_id;
    let nextCustomerDetails = invoice.customer_details;

    if (customer_id && customer_id !== invoice.customer_id) {
      const customer = await Customers.findOne({
        where: { id: customer_id, owner_id: userId },
      });
      if (!customer) {
        sendResponse(response, 400, "Customer not found");
        return;
      }
      nextCustomerId = customer.id;
      nextCustomerDetails = {
        id: customer.id,
        name: customer.name,
        phone_number: customer.phone_number,
        location: customer.location,
        email: customer.email,
      };
    }

    if (products && (!Array.isArray(products) || products.length === 0)) {
      sendResponse(response, 400, "products must be a non-empty array");
      return;
    }

    await invoice.update({
      customer_id: nextCustomerId,
      customer_details: nextCustomerDetails,
      products: products ?? invoice.products,
      narration: narration ?? invoice.narration,
      delivery_fees: delivery_fees ?? invoice.delivery_fees,
      auto_approve: auto_approve ?? invoice.auto_approve,
    });

    sendResponse(response, 200, "Invoice updated", invoice);
    return;
  } catch (error: any) {
    console.error("Error in updateInvoice:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Update an invoice
 *     description: Updates an invoice for the authenticated user.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               narration:
 *                 type: string
 *               delivery_fees:
 *                 type: number
 *               auto_approve:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Invoice updated.
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
 *                   example: Invoice updated
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: INV-1700000000000
 *                     owner_id:
 *                       type: string
 *                     customer_id:
 *                       type: string
 *                     customer_details:
 *                       type: object
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                     narration:
 *                       type: string
 *                       nullable: true
 *                     delivery_fees:
 *                       type: number
 *                       nullable: true
 *                     auto_approve:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invoice not found or validation error.
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
 *         description: Server error while updating invoice.
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
