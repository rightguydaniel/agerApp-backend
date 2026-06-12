import fs from "fs";
import { Request, Response, type Express } from "express";
import Testimonial from "../../models/Testimonial";
import sendResponse from "../../utils/http/sendResponse";
import {
  buildTestimonialImageUrl,
  resolveLocalTestimonialImagePath,
} from "../../utils/services/media";

export const updateTestimonial = async (
  request: Request,
  response: Response,
) => {
  try {
    const { id } = request.params;
    const { name, company, image, testimonial, isVisible } =
      request.body as Record<string, any>;
    const uploadedImage = request.file as Express.Multer.File | undefined;

    const testimonialRecord = await Testimonial.findByPk(id);
    if (!testimonialRecord) {
      sendResponse(response, 404, "Testimonial not found");
      return;
    }

    const removeExistingImageFromDisk = () => {
      if (!testimonialRecord.image) {
        return;
      }

      const isHostedImage = !testimonialRecord.image.includes(
        "/uploads/testimonials/",
      );
      if (isHostedImage) {
        return;
      }

      const existingPath = resolveLocalTestimonialImagePath(
        testimonialRecord.image,
      );
      if (fs.existsSync(existingPath)) {
        try {
          fs.unlinkSync(existingPath);
        } catch (unlinkError) {
          console.warn(
            "Failed to remove existing testimonial image",
            unlinkError,
          );
        }
      }
    };

    let updatedImage = testimonialRecord.image;

    if (uploadedImage) {
      removeExistingImageFromDisk();
      updatedImage = buildTestimonialImageUrl(uploadedImage.filename);
    } else if (image !== undefined) {
      const trimmedImage = typeof image === "string" ? image.trim() : "";
      if (!trimmedImage) {
        removeExistingImageFromDisk();
        updatedImage = null;
      } else if (trimmedImage !== testimonialRecord.image) {
        removeExistingImageFromDisk();
        updatedImage = trimmedImage;
      }
    }

    const normalizeBoolean = (value: any): boolean => {
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        return ["true", "1", "yes"].includes(value.toLowerCase());
      }
      return Boolean(value);
    };

    const updatedVisibility =
      isVisible !== undefined
        ? normalizeBoolean(isVisible)
        : testimonialRecord.isVisible;

    await testimonialRecord.update({
      name: name ?? testimonialRecord.name,
      company: company ?? testimonialRecord.company,
      image: updatedImage,
      testimonial: testimonial ?? testimonialRecord.testimonial,
      isVisible: updatedVisibility,
    });

    sendResponse(response, 200, "Testimonial updated", testimonialRecord);
  } catch (error: any) {
    console.error("Error updating testimonial", error?.message || error);
    sendResponse(
      response,
      500,
      "Failed to update testimonial",
      error?.message || error,
    );
  }
};

/**
 * @swagger
 * /admin/testimonials/{id}:
 *   put:
 *     summary: Update a testimonial
 *     description: Admin-only endpoint to update an existing testimonial.
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Testimonial updated successfully.
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
