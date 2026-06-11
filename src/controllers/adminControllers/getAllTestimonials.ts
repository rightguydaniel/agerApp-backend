import { Request, Response } from "express";
import Testimonial from "../../models/Testimonial";
import sendResponse from "../../utils/http/sendResponse";

export const getAllTestimonials = async (
  request: Request,
  response: Response,
) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "20", 10);
    const offset = (page - 1) * perPage;

    const { rows, count } = await Testimonial.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    sendResponse(response, 200, "Admin testimonials retrieved", {
      items: rows,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages: Math.max(Math.ceil(count / perPage), 1),
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin testimonials", error?.message || error);
    sendResponse(
      response,
      500,
      "Failed to fetch testimonials",
      error?.message || error,
    );
  }
};

/**
 * @swagger
 * /admin/testimonials:
 *   get:
 *     summary: List all testimonials for admin
 *     description: Returns all testimonials, including hidden ones, for admin management.
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Admin testimonials retrieved successfully.
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
