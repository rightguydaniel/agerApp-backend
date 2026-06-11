import { Request, Response, type Express } from "express";
import Testimonial from "../../models/Testimonial";
import sendResponse from "../../utils/http/sendResponse";
import { buildTestimonialImageUrl } from "../../utils/services/media";

const normalizeBoolean = (value: any): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }
  return Boolean(value);
};

export const createTestimonial = async (
  request: Request,
  response: Response,
) => {
  try {
    const { name, company, image, testimonial, isVisible } = request.body as Record<string, any>;
    const uploadedImage = request.file as Express.Multer.File | undefined;

    if (!name || !company || !testimonial) {
      sendResponse(
        response,
        400,
        "Name, company, and testimonial are required",
      );
      return;
    }

    const resolvedImage = uploadedImage
      ? buildTestimonialImageUrl(uploadedImage.filename)
      : typeof image === "string" && image.trim() !== ""
      ? image.trim()
      : null;

    const isVisibleFlag = isVisible === undefined ? true : normalizeBoolean(isVisible);

    const createdTestimonial = await Testimonial.create({
      name,
      company,
      image: resolvedImage,
      testimonial,
      isVisible: isVisibleFlag,
    });

    sendResponse(response, 200, "Testimonial created", createdTestimonial);
  } catch (error: any) {
    console.error("Error creating testimonial", error?.message || error);
    sendResponse(
      response,
      500,
      "Failed to create testimonial",
      error?.message || error,
    );
  }
};

/**
 * @swagger
 * /admin/testimonials:
 *   post:
 *     summary: Create a testimonial
 *     description: Admin-only endpoint to create a new testimonial entry.
 *     tags:
 *       - Testimonials
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
 *               company:
 *                 type: string
 *               testimonial:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *               isVisible:
 *                 type: boolean
 *             required:
 *               - name
 *               - company
 *               - testimonial
 *     responses:
 *       200:
 *         description: Testimonial created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
