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
exports.getPostBySlug = void 0;
const BlogPost_1 = __importDefault(require("../../models/BlogPost"));
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const getPostBySlug = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = request.params;
        const post = yield BlogPost_1.default.findOne({ where: { slug, isPublished: true } });
        if (!post) {
            (0, sendResponse_1.default)(response, 404, "Blog post not found");
            return;
        }
        yield post.increment("views");
        yield post.reload();
        (0, sendResponse_1.default)(response, 200, "Blog post retrieved", post);
    }
    catch (error) {
        console.error("Error fetching blog post", error.message);
        (0, sendResponse_1.default)(response, 500, "Failed to fetch blog post", error.message);
    }
});
exports.getPostBySlug = getPostBySlug;
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
