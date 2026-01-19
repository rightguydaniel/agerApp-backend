import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";

export const addCustomer = async (request: JwtPayload, response: Response) => {
  const userId = request.user.id;
  const { name, phone_number, location, email } = request.body as {
    name?: string;
    phone_number?: string;
    location?: string;
    email?: string;
  };

  try {
    if (!name || !phone_number || !location || !email) {
      sendResponse(response, 400, "Missing fields");
      return;
    }

    const customer = await Customers.create({
      owner_id: userId,
      name,
      phone_number,
      location,
      email,
    });

    sendResponse(response, 200, "Customer added", customer);
    return;
  } catch (error: any) {
    console.error("Error in addCustomer:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Add a customer
 *     description: Creates a new customer for the authenticated user.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone_number
 *               - location
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone_number:
 *                 type: string
 *                 example: "+2348012345678"
 *               location:
 *                 type: string
 *                 example: Lagos
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Customer added.
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
 *                   example: Customer added
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
 *                       example: 2024-01-15T10:00:00.000Z
 *       400:
 *         description: Missing required fields.
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
 *                   example: Missing fields
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
 *         description: Server error while adding customer.
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
