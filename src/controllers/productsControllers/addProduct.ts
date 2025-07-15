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
      quantity_type,
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
      quantity_type,
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
 * /products/add:
 *   post:
 *     summary: Add a new product to the inventory.
 *     description: This endpoint allows users to add a new product to their inventory. The user must provide required fields such as name, quantity, and price. Optional fields include measurement, expiry date, restock alert, and an image file.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product.
 *                 example: "Milk"
 *               measurement:
 *                 type: string
 *                 description: Measurement unit of the product.
 *                 example: "Liters"
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product.
 *                 example: 10
 *               quantity_type:
 *                 type: string
 *                 description: Type of quantity (e.g., units, kg, liters).
 *                 example: "Liters"
 *               price:
 *                 type: number
 *                 description: Price of the product.
 *                 example: 5.99
 *               expiry:
 *                 type: string
 *                 format: date
 *                 description: Expiry date of the product.
 *                 example: "2023-12-31"
 *               restock_alert:
 *                 type: number
 *                 description: Restock alert threshold.
 *                 example: 5
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the product.
 *     responses:
 *       200:
 *         description: Product successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product Added"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing fields"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */
