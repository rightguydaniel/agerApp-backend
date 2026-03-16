import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";
import Invoices from "../../models/Invoices";
import Products from "../../models/Products";
import { database } from "../../configs/database/database";
import Users from "../../models/Users";
import UserBankDetails from "../../models/UserBankDetails";
import { sendEmail } from "../../configs/email/emailConfig";
import {
  sendRestockAlertEmail,
  type RestockAlertEmailItem,
} from "../../utils/services/restockAlertNotifier";

export const createInvoice = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const {
    customer_id,
    products,
    tax,
    narration,
    delivery_fees,
    auto_approve,
    discounts,
  } = request.body as {
    customer_id?: string;
    products?: Array<{
      product_id?: string;
      productId?: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    tax?: number;
    narration?: string;
    delivery_fees?: number;
    auto_approve?: boolean;
    discounts?: number;
  };
  console.log("Create Invoice payload:", request.body)
  const invoiceId = `INV-${Date.now()}`;
  try {
    if (!customer_id || !Array.isArray(products) || products.length === 0) {
      sendResponse(response, 400, "customer_id and products are required");
      return;
    }
    if (
      (tax !== undefined && Number.isNaN(Number(tax))) ||
      (delivery_fees !== undefined && Number.isNaN(Number(delivery_fees))) ||
      (discounts !== undefined && Number.isNaN(Number(discounts)))
    ) {
      sendResponse(response, 400, "Invalid tax, delivery fees, or discounts");
      return;
    }

    const customer = await Customers.findOne({
      where: { id: customer_id, owner_id: userId },
    });
    if (!customer) {
      sendResponse(response, 400, "Customer not found");
      return;
    }

    const badRequest = (message: string): never => {
      const error = new Error(message) as Error & { status?: number };
      error.status = 400;
      throw error;
    };
    const normalizedProducts =
      products?.map((item) => ({
        ...item,
        product_id: item.product_id ?? item.productId,
      })) ?? [];

    let invoice: Invoices | null = null;
    let subtotal = 0;
    let totalCalculated = 0;
    let lineItems: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];
    const restockAlerts: RestockAlertEmailItem[] = [];

    await database.transaction(async (transaction) => {
      const productQuantities = new Map<string, number>();
      for (const item of normalizedProducts) {
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
      const productsById = new Map<string, Products>();

      if (productIds.length > 0) {
        const dbProducts = await Products.findAll({
          where: { owner_id: userId, id: productIds },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (dbProducts.length !== productIds.length) {
          badRequest("One or more products not found");
        }

        for (const product of dbProducts) {
          productsById.set(product.id, product);
        }

        const getProductOrThrow = (productId: string): Products => {
          const product = productsById.get(productId);
          if (!product) {
            badRequest("One or more products not found");
          }
          return product!;
        };

        for (const [productId, qty] of productQuantities.entries()) {
          const product = getProductOrThrow(productId);
          const available = Number(product?.quantity);
          if (Number.isNaN(available)) {
            badRequest("Invalid product quantity");
          }
          if (available < qty) {
            badRequest(`Insufficient stock for product ${product?.name}`);
          }
        }

        for (const [productId, qty] of productQuantities.entries()) {
          const product = getProductOrThrow(productId);
          const previousQuantity = Number(product.quantity);
          const nextQuantity = previousQuantity - qty;
          const restockAlert = Number(product.restock_alert ?? 0);

          await product.update({ quantity: nextQuantity }, { transaction });

          if (
            restockAlert > 0 &&
            previousQuantity > restockAlert &&
            nextQuantity <= restockAlert
          ) {
            restockAlerts.push({
              productName: product.name,
              quantity: nextQuantity,
              restockAlert,
            });
          }
        }
      }

      let computedSubtotal = 0;
      const computedLineItems: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }> = [];
      for (const item of normalizedProducts) {
        const qty = Number(item.quantity);
        if (Number.isNaN(qty) || qty <= 0) {
          badRequest("Invalid product quantity");
        }

        if (item.product_id && productsById.has(item.product_id)) {
          const product = productsById.get(item.product_id);
          if (!product) {
            badRequest("One or more products not found");
          }
          const price = Number(product?.price);
          if (Number.isNaN(price) || price < 0) {
            badRequest("Invalid product price");
          }
          const lineTotal = price * qty;
          computedSubtotal += lineTotal;
          computedLineItems.push({
            name: product?.name ?? item.name,
            quantity: qty,
            unitPrice: price,
            lineTotal,
          });
        } else {
          const price = Number(item.price);
          if (Number.isNaN(price) || price < 0) {
            badRequest("Invalid product price");
          }
          const lineTotal = price * qty;
          computedSubtotal += lineTotal;
          computedLineItems.push({
            name: item.name,
            quantity: qty,
            unitPrice: price,
            lineTotal,
          });
        }
      }

      subtotal = computedSubtotal;
      lineItems = computedLineItems;
      totalCalculated =
        computedSubtotal +
        Number(tax ?? 0) +
        Number(delivery_fees ?? 0) -
        Number(discounts ?? 0);

      invoice = await Invoices.create(
        {
          id: invoiceId,
          owner_id: userId,
          customer_id: customer.id,
          customer_details: {
            id: customer.id,
            name: customer.name,
            phone_number: customer.phone_number,
            location: customer.location,
            email: customer.email,
          },
          products: normalizedProducts,
          tax: tax ?? null,
          total: totalCalculated,
          narration: narration ?? null,
          delivery_fees: delivery_fees ?? null,
          discounts: discounts ?? 0,
          auto_approve: auto_approve ?? false,
        },
        { transaction }
      );
    });

    if (!invoice) {
      sendResponse(response, 500, "Internal Server Error");
      return;
    }

    const owner = await Users.findByPk(userId);
    const bankDetails = await UserBankDetails.findOne({
      where: { user_id: userId },
    });

    const formatCurrency = (value: number) => {
      if (Number.isNaN(value)) {
        return "N0";
      }
      try {
        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        return `N${value.toLocaleString("en-NG")}`;
      }
    };

    const formatDateTime = (date: Date) => {
      const pad = (num: number) => String(num).padStart(2, "0");
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = pad(date.getMinutes());
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${day}-${month}-${year} | ${hours}:${minutes}${ampm}`;
    };

    const businessName = owner?.business_name || owner?.full_name || "AgerApp";
    const invoiceDate = formatDateTime(new Date());

    if (owner?.email && restockAlerts.length > 0) {
      await sendRestockAlertEmail(owner.email, businessName, restockAlerts).catch(
        (mailError) => {
          console.error(
            "Failed to send restock alert email in createInvoice:",
            mailError?.message ?? mailError
          );
        }
      );
    }

    const invoiceHtml = `
      <div style="background:#F7F7F7;padding:20px 12px;">
        <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:16px;border:1px solid #E5EEE6;overflow:hidden;">
          <div style="padding:18px 22px;border-bottom:1px solid #E5EEE6;font-family:Arial, sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:14px;color:#2E6130;font-weight:700;">${invoiceId}</div>
              <div style="font-size:12px;color:#6B6B6B;">${invoiceDate}</div>
            </div>
          </div>
          <div style="padding:20px 22px;font-family:Arial, sans-serif;color:#1E1E1E;">
            <div style="display:flex;justify-content:space-between;gap:20px;">
              <div>
                <div style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.08em;">Billed to</div>
                <div style="margin-top:6px;font-size:16px;font-weight:700;">${customer.name}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.08em;">From</div>
                <div style="margin-top:6px;font-size:16px;font-weight:700;">${businessName}</div>
              </div>
            </div>

            <div style="margin-top:18px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.08em;">Billed for</div>
            <div style="margin-top:8px;border-top:1px solid #E5EEE6;">
              ${lineItems
                .map(
                  (item) => `
                    <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #F1F1F1;">
                      <div style="font-size:14px;color:#1E1E1E;">
                        ${item.name} <span style="color:#6B6B6B;">x${item.quantity}</span>
                      </div>
                      <div style="font-size:14px;font-weight:600;color:#1E1E1E;">${formatCurrency(
                        item.lineTotal
                      )}</div>
                    </div>
                  `
                )
                .join("")}
            </div>

            ${
              narration
                ? `
                <div style="margin-top:16px;">
                  <div style="font-size:12px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.08em;">Narration</div>
                  <div style="margin-top:6px;font-size:13px;line-height:1.6;color:#3B3B3B;">${narration}</div>
                </div>
              `
                : ""
            }

            <div style="margin-top:18px;border-top:1px dashed #DDE7DE;padding-top:12px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E1E1E;">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E1E1E;margin-top:8px;">
                <span>Discounts</span>
                <span>${formatCurrency(Number(discounts ?? 0))}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E1E1E;margin-top:8px;">
                <span>Tax</span>
                <span>${formatCurrency(Number(tax ?? 0))}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E1E1E;margin-top:8px;">
                <span>Delivery fees</span>
                <span>${formatCurrency(Number(delivery_fees ?? 0))}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#1E1E1E;margin-top:12px;">
                <span>Total</span>
                <span>${formatCurrency(totalCalculated)}</span>
              </div>
            </div>

            ${
              bankDetails
                ? `
                <div style="margin-top:20px;border-top:1px solid #E5EEE6;padding-top:14px;">
                  <div style="font-size:12px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.08em;">Bank Details</div>
                  <div style="margin-top:6px;font-size:13px;color:#1E1E1E;">
                    ${bankDetails.bank_name} • ${bankDetails.account_number}
                  </div>
                  <div style="margin-top:4px;font-size:13px;color:#1E1E1E;">
                    ${bankDetails.account_name}
                  </div>
                </div>
              `
                : ""
            }
          </div>
        </div>
      </div>
    `;

    if (customer.email) {
      await sendEmail(
        customer.email,
        `Invoice ${invoiceId}`,
        undefined,
        invoiceHtml
      );
    }

    sendResponse(response, 200, "Invoice created", invoice);
    return;
  } catch (error: any) {
    console.error("Error in createInvoice:", error.message);
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
 *               discounts:
 *                 type: number
 *                 example: 500
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
 *                     discounts:
 *                       type: number
 *                       nullable: true
 *                       example: 500
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
