import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Banks from "../../models/Banks";

export const allBanks = async (req:Request, res:Response) => {
    try{
        const banks = await Banks.findAll({});
        sendResponse(res, 200, "Banks fetched successfully", banks);
    }catch(error:any){
        console.error("Error fetching all banks:", error);
        sendResponse(res, 500, "Failed to fetch banks", error.message);
    }
}

/**
 * @swagger
 * /banks:
 *   get:
 *     summary: Get all banks
 *     description: Returns the list of banks stored in the system.
 *     tags:
 *       - Banks
 *     responses:
 *       200:
 *         description: Banks fetched successfully.
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
 *                   example: Banks fetched successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                       name:
 *                         type: string
 *                         example: First Bank of Nigeria
 *                       code:
 *                         type: string
 *                         example: "011"
 *                       currency:
 *                         type: string
 *                         example: NGN
 *       500:
 *         description: Server error while fetching banks.
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
 *                   example: Failed to fetch banks
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: Error details here
 */
