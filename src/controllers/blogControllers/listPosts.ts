import { Request, Response } from "express";
import BlogPost from "../../models/BlogPost";
import sendResponse from "../../utils/http/sendResponse";

export const listPublishedPosts = async (
  request: Request,
  response: Response
) => {
  try {
    const posts = await BlogPost.findAll({
      where: { isPublished: true },
      order: [["publishedAt", "DESC"]],
      attributes: [
        "id",
        "title",
        "slug",
        "excerpt",
        "coverImage",
        "authorName",
        "publishedAt",
        "views",
      ],
    });

    sendResponse(response, 200, "Blog posts retrieved", posts);
  } catch (error: any) {
    console.error("Error fetching blog posts", error.message);
    sendResponse(response, 500, "Failed to fetch blog posts", error.message);
  }
};



/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: List published blog posts
 *     description: Returns all published blog posts ordered from newest to oldest.
 *     tags:
 *       - Blogs
 *     responses:
 *       200:
 *         description: Successfully retrieved the published blog posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error while retrieving posts.
 */
export const listAllPosts = async (request: Request, response: Response) => {
  try {
    const posts = await BlogPost.findAll({
      order: [["createdAt", "DESC"]],
    });

    sendResponse(response, 200, "All blog posts retrieved", posts);
  } catch (error: any) {
    console.error("Error fetching all blog posts", error.message);
    sendResponse(response, 500, "Failed to fetch all blog posts", error.message);
  }
};


/**
 * @swagger
 * /blogs/admin:
 *   get:
 *     summary: List all blog posts (admin)
 *     description: Returns every blog post regardless of publication status. Requires an admin token.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all blog posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Authentication token missing or invalid.
 *       403:
 *         description: Authenticated user is not an admin.
 *       500:
 *         description: Server error while retrieving posts.
 */
