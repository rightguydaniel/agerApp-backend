import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";

export const editCustomer = async (
  request: JwtPayload,
  response: Response
) => {
  const userId = request.user.id;
  const customerId = request.params.id;
  const { name, phone_number, location, email } = request.body as {
    name?: string;
    phone_number?: string;
    location?: string;
    email?: string;
  };

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

    await customer.update({
      name: name ?? customer.name,
      phone_number: phone_number ?? customer.phone_number,
      location: location ?? customer.location,
      email: email ?? customer.email,
    });

    sendResponse(response, 200, "Customer updated", customer);
    return;
  } catch (error: any) {
    console.error("Error in editCustomer:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update a customer
 *     description: Updates a customer owned by the authenticated user.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               location:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Customer updated.
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
 *                   example: Customer updated
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
 *         description: Server error while updating customer.
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
