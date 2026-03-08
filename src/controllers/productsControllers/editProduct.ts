import { Response } from "express";
import fs from "fs";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import Products from "../../models/Products";
import Users from "../../models/Users";
import {
  buildProductImageUrl,
  resolveLocalProductImagePath,
} from "../../utils/services/media";
import { sendRestockAlertEmail } from "../../utils/services/restockAlertNotifier";

export const editProduct = async (request: JwtPayload, response: Response) => {
  const userId = request.user.id;
  const productId = request.params.id;
  const {
    name,
    measurement,
    quantity,
    quantity_type,
    price,
    expiry,
    restock_alert,
  } = request.body;
  try {
    if (!productId) {
      sendResponse(response, 400, "Product Id is missing");
      return;
    }
    const product = await Products.findOne({
      where: { owner_id: userId, id: productId },
    });
    if (!product) {
      sendResponse(response, 400, "Product not found");
      return;
    }
    const files = request.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const images = files?.image || [];

    const removeExistingImageFromDisk = () => {
      if (!product.image) {
        return;
      }
      const imageList = Array.isArray(product.image)
        ? product.image
        : [product.image];
      imageList.forEach((imageUrl) => {
        if (!imageUrl) {
          return;
        }
        const isHostedImage = !imageUrl.includes("/uploads/products/");
        if (isHostedImage) {
          return;
        }
        const existingPath = resolveLocalProductImagePath(imageUrl);
        if (fs.existsSync(existingPath)) {
          try {
            fs.unlinkSync(existingPath);
          } catch (unlinkError) {
            console.warn("Failed to remove product image", unlinkError);
          }
        }
      });
    };

    const nextImage =
      images.length > 0
        ? (() => {
            removeExistingImageFromDisk();
            return images.map((file) => buildProductImageUrl(file.filename));
          })()
        : product.image;

    const previousQuantity = Number(product.quantity);
    const nextQuantity =
      quantity !== undefined ? Number(quantity) : Number(product.quantity);
    const nextRestockAlert =
      restock_alert !== undefined
        ? Number(restock_alert)
        : Number(product.restock_alert ?? 0);

    if (Number.isNaN(nextQuantity) || nextQuantity < 0) {
      sendResponse(response, 400, "Invalid product quantity");
      return;
    }

    if (Number.isNaN(nextRestockAlert) || nextRestockAlert < 0) {
      sendResponse(response, 400, "Invalid restock_alert");
      return;
    }

    await product.update({
      name: name ? name : product.name,
      measurement: measurement ? measurement : product.measurement,
      quantity: nextQuantity,
      quantity_type: quantity_type ? quantity_type : product.quantity_type,
      price: price ? price : product.price,
      expiry_date: expiry ? expiry : product.expiry_date,
      restock_alert: nextRestockAlert,
      image: nextImage,
    });

    if (
      nextRestockAlert > 0 &&
      previousQuantity > nextRestockAlert &&
      nextQuantity <= nextRestockAlert
    ) {
      const owner = await Users.findByPk(userId);
      const businessName =
        owner?.business_name || owner?.full_name || "AgerApp";
      if (owner?.email) {
        await sendRestockAlertEmail(owner.email, businessName, [
          {
            productName: product.name,
            quantity: nextQuantity,
            restockAlert: nextRestockAlert,
          },
        ]).catch((mailError) => {
          console.error(
            "Failed to send restock alert email in editProduct:",
            mailError?.message ?? mailError
          );
        });
      }
    }

    sendResponse(response, 200, "Product Updated");
    return;
  } catch (error: any) {
    console.log("Error in editProduct", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};

/**
 * @swagger
 * /products/edit/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates details of the specified product owned by the authenticated user.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifier of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               measurement:
 *                 type: string
 *               quantity:
 *                 type: number
 *               quantity_type:
 *                 type: string
 *               price:
 *                 type: number
 *               expiry:
 *                 type: string
 *                 format: date
 *               restock_alert:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully.
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
 *                   example: Product Updated
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Product ID missing or product not found.
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
 *                   example: Product not found
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
 *         description: Server error while updating the product.
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
