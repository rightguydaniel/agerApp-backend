import fs from "fs";
import { Request, Response } from "express";
import BlogPost from "../../models/BlogPost";
import sendResponse from "../../utils/http/sendResponse";
import { resolveLocalBlogImagePath } from "../../utils/services/media";

export const deletePost = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const post = await BlogPost.findByPk(id);

    if (!post) {
      sendResponse(response, 404, "Blog post not found");
      return;
    }

    if (post.coverImage) {
      const imagePath = resolveLocalBlogImagePath(post.coverImage);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkError) {
          console.warn("Failed to remove blog cover image", unlinkError);
        }
      }
    }

    await post.destroy();
    sendResponse(response, 200, "Blog post deleted");
  } catch (error: any) {
    console.error("Error deleting blog post", error.message);
    sendResponse(response, 500, "Failed to delete blog post", error.message);
  }
};


/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Deletes the specified blog post. Requires admin authentication.
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
 *         description: Identifier of the blog post to delete.
 *     responses:
 *       200:
 *         description: Blog post deleted successfully.
 *       404:
 *         description: Blog post not found.
 *       500:
 *         description: Server error while deleting the blog post.
 */
