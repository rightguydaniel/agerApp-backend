import { Request, Response } from "express";
import { Op } from "sequelize";
import BlogPost from "../../models/BlogPost";
import sendResponse from "../../utils/http/sendResponse";

export const listPublishedPosts = async (
  request: Request,
  response: Response
) => {
  try {
    const page = parseInt((request.query.page as string) || "1", 10);
    const perPage = parseInt((request.query.perPage as string) || "12", 10);
    const keyword = ((request.query.keyword as string) || "").trim();
    const offset = (page - 1) * perPage;

    const whereClause: any = { isPublished: true };
    if (keyword) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { excerpt: { [Op.like]: `%${keyword}%` } },
        { authorName: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { rows, count } = await BlogPost.findAndCountAll({
      where: whereClause,
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
      limit: perPage,
      offset,
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Blog posts retrieved", {
      items: rows,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages,
      },
    });
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
 *     description: Returns published blog posts ordered from newest to oldest with pagination and keyword search.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: perPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of posts per page.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to search by title, excerpt, or author.
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
