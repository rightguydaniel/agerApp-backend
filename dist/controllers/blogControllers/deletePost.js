"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = void 0;
const fs_1 = __importDefault(require("fs"));
const BlogPost_1 = __importDefault(require("../../models/BlogPost"));
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const media_1 = require("../../utils/services/media");
const deletePost = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const post = yield BlogPost_1.default.findByPk(id);
        if (!post) {
            (0, sendResponse_1.default)(response, 404, "Blog post not found");
            return;
        }
        if (post.coverImage) {
            const imagePath = (0, media_1.resolveLocalBlogImagePath)(post.coverImage);
            if (fs_1.default.existsSync(imagePath)) {
                try {
                    fs_1.default.unlinkSync(imagePath);
                }
                catch (unlinkError) {
                    console.warn("Failed to remove blog cover image", unlinkError);
                }
            }
        }
        yield post.destroy();
        (0, sendResponse_1.default)(response, 200, "Blog post deleted");
    }
    catch (error) {
        console.error("Error deleting blog post", error.message);
        (0, sendResponse_1.default)(response, 500, "Failed to delete blog post", error.message);
    }
});
exports.deletePost = deletePost;
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
