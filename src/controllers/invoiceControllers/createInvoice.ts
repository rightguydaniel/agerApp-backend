import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";
import Invoices from "../../models/Invoices";

export const createInvoice = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const {
    customer_id,
    products,
    tax,
    total,
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
    tax?: number;
    total?: number;
    narration?: string;
    delivery_fees?: number;
    auto_approve?: boolean;
  };

  try {
    if (!customer_id || !Array.isArray(products) || products.length === 0) {
      sendResponse(response, 400, "customer_id and products are required");
      return;
    }

    const customer = await Customers.findOne({
      where: { id: customer_id, owner_id: userId },
    });
    if (!customer) {
      sendResponse(response, 400, "Customer not found");
      return;
    }

    const invoice = await Invoices.create({
      id: `INV-${Date.now()}`,
      owner_id: userId,
      customer_id: customer.id,
      customer_details: {
        id: customer.id,
        name: customer.name,
        phone_number: customer.phone_number,
        location: customer.location,
        email: customer.email,
      },
      products,
      tax: tax ?? null,
      total: total ?? null,
      narration: narration ?? null,
      delivery_fees: delivery_fees ?? null,
      auto_approve: auto_approve ?? false,
    });

    sendResponse(response, 200, "Invoice created", invoice);
    return;
  } catch (error: any) {
    console.error("Error in createInvoice:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create an invoice
 *     description: Creates an invoice for a customer owned by the authenticated user.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - products
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: 2f1b2c3d-4e5f-6789-0abc-def123456789
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
 *                 example:
 *                   - product_id: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                     name: Fresh Apples
 *                     quantity: 2
 *                     price: 2500
 *               narration:
 *                 type: string
 *                 example: Delivery on Friday
 *               tax:
 *                 type: number
 *                 example: 150
 *               total:
 *                 type: number
 *                 example: 5150
 *               delivery_fees:
 *                 type: number
 *                 example: 500
 *               auto_approve:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Invoice created.
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
 *                   example: Invoice created
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
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone_number:
 *                           type: string
 *                         location:
 *                           type: string
 *                         email:
 *                           type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                     narration:
 *                       type: string
 *                       nullable: true
 *                       example: Delivery on Friday
 *                     tax:
 *                       type: number
 *                       nullable: true
 *                       example: 150
 *                     total:
 *                       type: number
 *                       nullable: true
 *                       example: 5150
 *                     delivery_fees:
 *                       type: number
 *                       nullable: true
 *                       example: 500
 *                     auto_approve:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *       400:
 *         description: Validation error or customer not found.
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
 *                   example: customer_id and products are required
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
 *         description: Server error while creating invoice.
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
