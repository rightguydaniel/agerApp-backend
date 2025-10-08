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
exports.createPost = void 0;
const BlogPost_1 = __importDefault(require("../../models/BlogPost"));
const Users_1 = __importDefault(require("../../models/Users"));
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const media_1 = require("../../utils/services/media");
const helpers_1 = require("./helpers");
const createPost = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, excerpt, coverImage, isPublished } = request.body;
        const uploadedCover = request.file;
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, sendResponse_1.default)(response, 401, "Unauthorized request");
            return;
        }
        if (!title || !content) {
            (0, sendResponse_1.default)(response, 400, "Title and content are required");
            return;
        }
        const author = yield Users_1.default.findByPk(userId);
        if (!author) {
            (0, sendResponse_1.default)(response, 404, "Author account not found");
            return;
        }
        const slug = yield (0, helpers_1.generateUniqueSlug)(title);
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
        const publishState = publishFlag !== undefined ? publishFlag : true;
        const resolvedCoverImage = uploadedCover
            ? (0, media_1.buildBlogImageUrl)(uploadedCover.filename)
            : typeof coverImage === "string" && coverImage.trim() !== ""
                ? coverImage.trim()
                : null;
        const post = yield BlogPost_1.default.create({
            title,
            slug,
            excerpt: typeof excerpt === "string" && excerpt.trim() !== "" ? excerpt.trim() : null,
            content,
            coverImage: resolvedCoverImage,
            isPublished: publishState,
            publishedAt: publishState ? new Date() : null,
            authorId: author.id,
            authorName: (0, helpers_1.getAuthorDisplayName)(author),
        });
        (0, sendResponse_1.default)(response, 200, "Blog post created successfully", post);
    }
    catch (error) {
        console.error("Error creating blog post", error.message);
        (0, sendResponse_1.default)(response, 500, "Failed to create blog post", error.message);
    }
});
exports.createPost = createPost;
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
