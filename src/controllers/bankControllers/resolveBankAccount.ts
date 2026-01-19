import { Response } from "express";
import { Request } from "express";
import sendResponse from "../../utils/http/sendResponse";

export const resolveBankAccount = async (
  request: Request,
  response: Response
) => {
  const { account_number, bank_code } = request.body;

  try {
    if (!account_number || !bank_code) {
      sendResponse(response, 400, "account_number and bank_code are required");
      return;
    }

    const secret = process.env.PAYSTACK_SECRET || "";
    if (!secret) {
      sendResponse(response, 500, "PAYSTACK_SECRET is not configured");
      return;
    }

    const url = `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(
      account_number
    )}&bank_code=${encodeURIComponent(bank_code)}`;

    const paystackResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      sendResponse(response, 400, "Failed to resolve account", errorText);
      return;
    }

    const payload = (await paystackResponse.json()) as {
      status: boolean;
      message: string;
      data?: Record<string, any>;
    };

    if (!payload.status) {
      sendResponse(response, 400, payload.message || "Account not resolved");
      return;
    }

    sendResponse(response, 200, "Account resolved", payload.data);
    return;
  } catch (error: any) {
    console.error("Error in resolveBankAccount:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /banks/resolve:
 *   post:
 *     summary: Resolve bank account number
 *     description: Verifies account number and bank code using Paystack.
 *     tags:
 *       - Banks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *               - bank_code
 *             properties:
 *               account_number:
 *                 type: string
 *                 example: "0001234567"
 *               bank_code:
 *                 type: string
 *                 example: "058"
 *     responses:
 *       200:
 *         description: Account resolved successfully.
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
 *                   example: Account resolved
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     account_number:
 *                       type: string
 *                       example: "0001234567"
 *                     account_name:
 *                       type: string
 *                       example: JOHN DOE
 *                     bank_id:
 *                       type: integer
 *                       example: 9
 *       400:
 *         description: Validation error or Paystack rejection.
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
 *                   example: account_number and bank_code are required
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Server error while resolving account.
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
