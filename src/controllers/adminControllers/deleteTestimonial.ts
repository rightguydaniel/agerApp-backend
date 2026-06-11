import { Request, Response } from "express";
import Testimonial from "../../models/Testimonial";
import sendResponse from "../../utils/http/sendResponse";

export const deleteTestimonial = async (
  request: Request,
  response: Response,
) => {
  try {
    const { id } = request.params;
    const testimonialRecord = await Testimonial.findByPk(id);

    if (!testimonialRecord) {
      sendResponse(response, 404, "Testimonial not found");
      return;
    }

    await testimonialRecord.destroy();
    sendResponse(response, 200, "Testimonial deleted");
  } catch (error: any) {
    console.error("Error deleting testimonial", error?.message || error);
    sendResponse(
      response,
      500,
      "Failed to delete testimonial",
      error?.message || error,
    );
  }
};

/**
 * @swagger
 * /admin/testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     description: Admin-only endpoint to delete a testimonial.
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
 *     responses:
 *       200:
 *         description: Testimonial deleted successfully.
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
 */
