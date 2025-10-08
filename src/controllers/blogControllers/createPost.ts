import { Request, Response } from "express";
import type { Express } from "express";
import BlogPost from "../../models/BlogPost";
import Users from "../../models/Users";
import sendResponse from "../../utils/http/sendResponse";
import { buildBlogImageUrl } from "../../utils/services/media";
import { generateUniqueSlug, getAuthorDisplayName } from "./helpers";

export const createPost = async (request: Request, response: Response) => {
  try {
    const { title, content, excerpt, coverImage, isPublished } = request.body as Record<string, any>;
    const uploadedCover = request.file as Express.Multer.File | undefined;
    const userId = request.user?.id as string | undefined;

    if (!userId) {
      sendResponse(response, 401, "Unauthorized request");
      return;
    }

    if (!title || !content) {
      sendResponse(response, 400, "Title and content are required");
      return;
    }

    const author = await Users.findByPk(userId);
    if (!author) {
      sendResponse(response, 404, "Author account not found");
      return;
    }

    const slug = await generateUniqueSlug(title);

    const normalizeBoolean = (value: any): boolean | undefined => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        const lowered = value.toLowerCase();
        if (["true", "1", "yes"].includes(lowered)) {
          return true;
        }
        if (["false", "0", "no"].includes(lowered)) {
          return false;
        }
      }
      return Boolean(value);
    };

    const publishFlag = normalizeBoolean(isPublished);
    const publishState = publishFlag !== undefined ? publishFlag : true;

    const resolvedCoverImage = uploadedCover
      ? buildBlogImageUrl(uploadedCover.filename)
      : typeof coverImage === "string" && coverImage.trim() !== ""
      ? coverImage.trim()
      : null;

    const post = await BlogPost.create({
      title,
      slug,
      excerpt: typeof excerpt === "string" && excerpt.trim() !== "" ? excerpt.trim() : null,
      content,
      coverImage: resolvedCoverImage,
      isPublished: publishState,
      publishedAt: publishState ? new Date() : null,
      authorId: author.id,
      authorName: getAuthorDisplayName(author),
    });

    sendResponse(response, 200, "Blog post created successfully", post);
  } catch (error: any) {
    console.error("Error creating blog post", error.message);
    sendResponse(response, 500, "Failed to create blog post", error.message);
  }
};


/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog post
 *     description: Creates a new blog article. Requires admin authentication.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog post.
 *               content:
 *                 type: string
 *                 description: Full HTML or Markdown content of the post.
 *               excerpt:
 *                 type: string
 *                 description: Short summary displayed on the listing page.
 *               coverImage:
 *                 type: string
 *                 description: Optional cover image URL for the article.
 *               isPublished:
 *                 type: boolean
 *                 description: Publish immediately if true; saves as draft when false.
 *     responses:
 *       200:
 *         description: Blog post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error (e.g. missing title or content).
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while creating the blog post.
 */
