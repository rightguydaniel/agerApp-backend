import { Request, Response } from "express";
import BlogPost from "../../models/BlogPost";
import sendResponse from "../../utils/http/sendResponse";

export const getPostBySlug = async (request: Request, response: Response) => {
  try {
    const { slug } = request.params;
    const post = await BlogPost.findOne({ where: { slug, isPublished: true } });

    if (!post) {
      sendResponse(response, 404, "Blog post not found");
      return;
    }

    await post.increment("views");
    await post.reload();

    sendResponse(response, 200, "Blog post retrieved", post);
  } catch (error: any) {
    console.error("Error fetching blog post", error.message);
    sendResponse(response, 500, "Failed to fetch blog post", error.message);
  }
};


/**
 * @swagger
 * /blogs/{slug}:
 *   get:
 *     summary: Retrieve a blog post by slug
 *     description: Returns the published blog post that matches the provided slug and increments its view counter.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly slug generated for the blog post.
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Blog post not found or unpublished.
 *       500:
 *         description: Server error while retrieving the blog post.
 */
