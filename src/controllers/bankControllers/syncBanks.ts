import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Banks from "../../models/Banks";

type PaystackBank = {
  name: string;
  code: string;
  currency: string;
};

export const syncBanks = async (_request: Request, response: Response) => {
  try {
    const secret = process.env.PAYSTACK_SECRET || "";
    if (!secret) {
      sendResponse(response, 500, "PAYSTACK_SECRET is not configured");
      return;
    }

    const paystackResponse = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      sendResponse(response, 500, "Failed to fetch banks", errorText);
      return;
    }

    const payload = (await paystackResponse.json()) as {
      status: boolean;
      message: string;
      data: PaystackBank[];
    };

    const banks = (payload.data || []).map((bank) => ({
      name: bank.name,
      code: bank.code,
      currency: bank.currency,
    }));

    if (banks.length > 0) {
      await Banks.bulkCreate(banks, {
        updateOnDuplicate: ["name", "currency"],
      });
    }

    sendResponse(response, 200, "Banks synced", {
      total: banks.length,
    });
    return;
  } catch (error: any) {
    console.error("Error in syncBanks:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /banks/sync:
 *   post:
 *     summary: Sync banks from Paystack
 *     description: Fetches banks from Paystack and upserts them into the local database if they are missing.
 *     tags:
 *       - Banks
 *     responses:
 *       200:
 *         description: Banks synced successfully.
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
 *                   example: Banks synced
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 250
 *       500:
 *         description: Server error while syncing banks.
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
