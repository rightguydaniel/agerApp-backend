import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Customers from "../../models/Customers";
import Users from "../../models/Users";

export const addCustomerFromUser = async (
  request: JwtPayload,
  response: Response
) => {
  const ownerId = request.user.id;
  const { user_id, location } = request.body as {
    user_id?: string;
    location?: string;
  };

  try {
    if (!user_id) {
      sendResponse(response, 400, "user_id is required");
      return;
    }

    if (user_id === ownerId) {
      sendResponse(response, 400, "You cannot add yourself as a customer");
      return;
    }

    const user = await Users.findByPk(user_id);
    if (!user) {
      sendResponse(response, 400, "User not found");
      return;
    }

    const existing = await Customers.findOne({
      where: { owner_id: ownerId, user_id },
    });
    if (existing) {
      sendResponse(response, 400, "User already added as customer");
      return;
    }

    const resolvedLocation =
      location ?? user.address ?? user.state ?? user.country ?? "";
    if (!resolvedLocation) {
      sendResponse(response, 400, "Customer location is required");
      return;
    }

    if (!user.phone) {
      sendResponse(response, 400, "Customer phone number is required");
      return;
    }

    const customer = await Customers.create({
      owner_id: ownerId,
      user_id: user.id,
      name: user.full_name,
      phone_number: user.phone,
      location: resolvedLocation,
      email: user.email,
    });

    sendResponse(response, 200, "Customer added", customer);
    return;
  } catch (error: any) {
    console.error("Error in addCustomerFromUser:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /customers/user:
 *   post:
 *     summary: Add a user as a customer
 *     description: Adds an existing user as a customer for the authenticated user.
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: 2f1b2c3d-4e5f-6789-0abc-def123456789
 *               location:
 *                 type: string
 *                 description: Optional override for customer location.
 *                 example: Lagos
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
 *                     user_id:
 *                       type: string
 *                       example: 1a2b3c4d-5e6f-7890-abcd-ef1234567890
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
 *         description: Validation error or user not found.
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
 *                   example: user_id is required
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
