import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import Products from "../../models/Products";
import { v4 } from "uuid";

export const addProduct = async (request: JwtPayload, response: Response) => {
  const userId = request.user.id;
  try {
    const {
      name,
      measurement,
      quantity,
      price,
      expiry,
      restock_alert,
    } = request.body;
    const files = request.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const image = files["image"]?.[0];
    if (!name || !quantity || !price) {
      sendResponse(response, 400, "Missing fields");
      return;
    }

    const newProduct = await Products.create({
      id: v4(),
      owner_id: userId,
      image: image ? image?.buffer : null,
      name,
      measurement,
      quantity,
      price,
      expiry_date: expiry ? expiry : null,
      restock_alert: restock_alert ? restock_alert : 0,
      number_of_restocks: 1,
    });
    sendResponse(response, 200, "Product Added");
    return;
  } catch (error: any) {
    console.log("Error in addProduct:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
  }
};

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a product
 *     description: Adds a new product to the authenticated user's inventory. Accepts optional metadata and an image upload.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name.
 *               measurement:
 *                 type: string
 *                 description: Measurement descriptor (e.g. kg, liters).
 *               quantity:
 *                 type: number
 *                 description: Quantity available.
 *               price:
 *                 type: number
 *                 description: Unit price for the product.
 *               expiry:
 *                 type: string
 *                 format: date
 *                 description: Optional expiry date.
 *               restock_alert:
 *                 type: number
 *                 description: Threshold to trigger restock alerts.
 *               image:
 *                 type: array
 *                 description: Optional product image uploads (send one or more files under the `image` field).
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product created successfully.
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while creating the product.
 */
