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
exports.updatePost = void 0;
const fs_1 = __importDefault(require("fs"));
const BlogPost_1 = __importDefault(require("../../models/BlogPost"));
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const media_1 = require("../../utils/services/media");
const helpers_1 = require("./helpers");
const updatePost = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const { title, excerpt, content, coverImage, authorName, isPublished, } = request.body;
        const uploadedCover = request.file;
        const post = yield BlogPost_1.default.findByPk(id);
        if (!post) {
            (0, sendResponse_1.default)(response, 404, "Blog post not found");
            return;
        }
        if (title) {
            post.title = title;
            post.slug = yield (0, helpers_1.generateUniqueSlug)(title, post.id);
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
            const existingPath = (0, media_1.resolveLocalBlogImagePath)(post.coverImage);
            if (fs_1.default.existsSync(existingPath)) {
                try {
                    fs_1.default.unlinkSync(existingPath);
                }
                catch (unlinkError) {
                    console.warn("Failed to remove blog cover image", unlinkError);
                }
            }
        };
        if (uploadedCover) {
            removeExistingCoverFromDisk();
            post.coverImage = (0, media_1.buildBlogImageUrl)(uploadedCover.filename);
        }
        else if (coverImage !== undefined) {
            const normalizedCover = typeof coverImage === "string" ? coverImage.trim() : "";
            if (!normalizedCover) {
                removeExistingCoverFromDisk();
                post.coverImage = null;
            }
            else if (normalizedCover !== post.coverImage) {
                removeExistingCoverFromDisk();
                post.coverImage = normalizedCover;
            }
        }
        if (authorName) {
            post.authorName = authorName;
        }
        const normalizeBoolean = (value) => {
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
        yield post.save();
        (0, sendResponse_1.default)(response, 200, "Blog post updated", post);
    }
    catch (error) {
        console.error("Error updating blog post", error.message);
        (0, sendResponse_1.default)(response, 500, "Failed to update blog post", error.message);
    }
});
exports.updatePost = updatePost;
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
