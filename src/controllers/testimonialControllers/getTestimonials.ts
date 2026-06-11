import { Request, Response } from "express";
import Testimonial from "../../models/Testimonial";
import sendResponse from "../../utils/http/sendResponse";

export const getTestimonials = async (request: Request, response: Response) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "10", 10);
    const offset = (page - 1) * perPage;

    const { rows, count } = await Testimonial.findAndCountAll({
      where: { isVisible: true },
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    sendResponse(response, 200, "Testimonials retrieved", {
      items: rows,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages: Math.max(Math.ceil(count / perPage), 1),
      },
    });
  } catch (error: any) {
    console.error("Error fetching testimonials", error?.message || error);
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
 * /testimonials:
 *   get:
 *     summary: Fetch visible testimonials
 *     description: Returns testimonials that are marked as visible for use on the public website.
 *     tags:
 *       - Testimonials
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of testimonials per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved testimonials.
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
 *                   example: Testimonials retrieved
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           company:
 *                             type: string
 *                           image:
 *                             type: string
 *                             nullable: true
 *                           testimonial:
 *                             type: string
 *                           isVisible:
 *                             type: boolean
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         perPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
