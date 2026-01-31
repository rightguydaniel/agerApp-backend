import { Request, Response } from "express";
import { Op } from "sequelize";
import BlogPost from "../../models/BlogPost";
import sendResponse from "../../utils/http/sendResponse";

const normalizeBaseUrl = (baseUrl: string) => {
  if (baseUrl.endsWith("/")) {
    return baseUrl.slice(0, -1);
  }
  return baseUrl;
};

const getFrontendBaseUrl = (request: Request) => {
  const configured =
    process.env.WEB_URL || process.env.FRONTEND_URL || "https://agerapp.com.ng";
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  const forwardedProto = request.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto?.split(",")[0]?.trim() || request.protocol;
  const host = request.get("host");
  if (!host) {
    return "";
  }
  return `${protocol}://${host}`;
};

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

    const frontendBaseUrl = getFrontendBaseUrl(request);
    const items = rows.map((post) => {
      const plainPost = post.get({ plain: true }) as any;
      return {
        ...plainPost,
        url: frontendBaseUrl
          ? `${frontendBaseUrl}/blog/${plainPost.slug}`
          : `/blog/${plainPost.slug}`,
      };
    });
    const totalPages = Math.ceil(count / perPage) || 1;

    sendResponse(response, 200, "Blog posts retrieved", {
      items,
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
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Blog posts retrieved
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
 *                           title:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           excerpt:
 *                             type: string
 *                             nullable: true
 *                           coverImage:
 *                             type: string
 *                             nullable: true
 *                           authorName:
 *                             type: string
 *                           publishedAt:
 *                             type: string
 *                             format: date-time
 *                           views:
 *                             type: integer
 *                           url:
 *                             type: string
 *                             example: https://agerapp.com.ng/blog/why-community-is-the-future-of-agribusiness
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
 *       500:
 *         description: Server error while retrieving posts.
 */
export const listAllPosts = async (request: Request, response: Response) => {
  try {
    const posts = await BlogPost.findAll({
      order: [["createdAt", "DESC"]],
    });

    const frontendBaseUrl = getFrontendBaseUrl(request);
    const items = posts.map((post) => {
      const plainPost = post.get({ plain: true }) as any;
      return {
        ...plainPost,
        url: frontendBaseUrl
          ? `${frontendBaseUrl}/blog/${plainPost.slug}`
          : `/blog/${plainPost.slug}`,
      };
    });

    sendResponse(response, 200, "All blog posts retrieved", items);
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
