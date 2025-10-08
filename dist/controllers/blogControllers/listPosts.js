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
exports.listAllPosts = exports.listPublishedPosts = void 0;
const BlogPost_1 = __importDefault(require("../../models/BlogPost"));
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const listPublishedPosts = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield BlogPost_1.default.findAll({
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
        (0, sendResponse_1.default)(response, 200, "Blog posts retrieved", posts);
    }
    catch (error) {
        console.error("Error fetching blog posts", error.message);
        (0, sendResponse_1.default)(response, 500, "Failed to fetch blog posts", error.message);
    }
});
exports.listPublishedPosts = listPublishedPosts;
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
const listAllPosts = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield BlogPost_1.default.findAll({
            order: [["createdAt", "DESC"]],
        });
        (0, sendResponse_1.default)(response, 200, "All blog posts retrieved", posts);
    }
    catch (error) {
        console.error("Error fetching all blog posts", error.message);
        (0, sendResponse_1.default)(response, 500, "Failed to fetch all blog posts", error.message);
    }
});
exports.listAllPosts = listAllPosts;
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
