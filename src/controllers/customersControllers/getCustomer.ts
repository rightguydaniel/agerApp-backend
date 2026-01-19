import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";

export const getCustomer = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const customerId = request.params.id;

  try {
    if (!customerId) {
      sendResponse(response, 400, "Customer Id is missing");
      return;
    }

    const customer = await Customers.findOne({
      where: { id: customerId, owner_id: userId },
    });

    if (!customer) {
      sendResponse(response, 400, "Customer not found");
      return;
    }

    sendResponse(response, 200, "Customer fetched", customer);
    return;
  } catch (error: any) {
    console.error("Error in getCustomer:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a customer
 *     description: Returns a customer owned by the authenticated user.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifier of the customer.
 *     responses:
 *       200:
 *         description: Customer fetched.
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
 *                   example: Customer fetched
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *                     owner_id:
 *                       type: string
 *                       example: 9a1b2c3d-4e5f-6789-0abc-def123456789
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     phone_number:
 *                       type: string
 *                       example: "+2348012345678"
 *                     location:
 *                       type: string
 *                       example: Lagos
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T12:00:00.000Z
 *       400:
 *         description: Customer ID missing or customer not found.
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
 *                   example: Customer not found
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
 *         description: Server error while fetching customer.
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
