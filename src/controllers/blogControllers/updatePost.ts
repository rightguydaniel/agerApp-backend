import { Request, Response } from "express";
import fs from "fs";
import BlogPost from "../../models/BlogPost";
import sendResponse from "../../utils/http/sendResponse";
import { buildBlogImageUrl, resolveLocalBlogImagePath } from "../../utils/services/media";
import { generateUniqueSlug } from "./helpers";

export const updatePost = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const {
      title,
      excerpt,
      content,
      coverImage,
      authorName,
      isPublished,
    } = request.body as Record<string, any>;
    const uploadedCover = request.file as Express.Multer.File | undefined;

    const post = await BlogPost.findByPk(id);
    if (!post) {
      sendResponse(response, 404, "Blog post not found");
      return;
    }

    if (title) {
      post.title = title;
      post.slug = await generateUniqueSlug(title, post.id);
    }

    if (excerpt !== undefined) {
      post.excerpt = typeof excerpt === "string" && excerpt.trim() !== "" ? excerpt.trim() : null;
    }

    if (content !== undefined) {
      post.content = content;
    }

    const removeExistingCoverFromDisk = () => {
      if (!post.coverImage) {
        return;
      }
      const isHostedImage = !post.coverImage.includes('/uploads/blogs/');
      if (isHostedImage) {
        return;
      }
      const existingPath = resolveLocalBlogImagePath(post.coverImage);
      if (fs.existsSync(existingPath)) {
        try {
          fs.unlinkSync(existingPath);
        } catch (unlinkError) {
          console.warn("Failed to remove blog cover image", unlinkError);
        }
      }
    };

    if (uploadedCover) {
      removeExistingCoverFromDisk();
      post.coverImage = buildBlogImageUrl(uploadedCover.filename);
    } else if (coverImage !== undefined) {
      const normalizedCover = typeof coverImage === "string" ? coverImage.trim() : "";
      if (!normalizedCover) {
        removeExistingCoverFromDisk();
        post.coverImage = null;
      } else if (normalizedCover !== post.coverImage) {
        removeExistingCoverFromDisk();
        post.coverImage = normalizedCover;
      }
    }

    if (authorName) {
      post.authorName = authorName;
    }

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
    if (publishFlag !== undefined) {
      post.isPublished = publishFlag;
      if (publishFlag && !post.publishedAt) {
        post.publishedAt = new Date();
      }
      if (!publishFlag) {
        post.publishedAt = null;
      }
    }

    await post.save();

    sendResponse(response, 200, "Blog post updated", post);
  } catch (error: any) {
    console.error("Error updating blog post", error.message);
    sendResponse(response, 500, "Failed to update blog post", error.message);
  }
};


/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     description: Updates the specified blog post, including title, content, status, and metadata. Requires admin authentication.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The identifier of the blog post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               authorName:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog post updated successfully.
 *       404:
 *         description: Blog post not found.
 *       500:
 *         description: Server error while updating the blog post.
 */
