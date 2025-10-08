"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLocalBlogImagePath = exports.buildBlogImageUrl = exports.getUploadsRootUrl = void 0;
const path_1 = __importDefault(require("path"));
const normalizeBaseUrl = (baseUrl) => {
    if (baseUrl.endsWith("/")) {
        return baseUrl.slice(0, -1);
    }
    return baseUrl;
};
const getUploadsRootUrl = () => {
    const baseUrl = process.env.API_URL || "";
    if (!baseUrl) {
        return "";
    }
    return `${normalizeBaseUrl(baseUrl)}/uploads/blogs`;
};
exports.getUploadsRootUrl = getUploadsRootUrl;
const buildBlogImageUrl = (filename) => {
    const base = (0, exports.getUploadsRootUrl)();
    if (!base) {
        return `/uploads/blogs/${filename}`;
    }
    return `${base}/${filename}`;
};
exports.buildBlogImageUrl = buildBlogImageUrl;
const resolveLocalBlogImagePath = (fileUrl) => {
    const uploadsPath = path_1.default.join(__dirname, "../../../uploads/blogs");
    const parts = fileUrl.split("/");
    const filename = parts[parts.length - 1];
    return path_1.default.join(uploadsPath, filename);
};
exports.resolveLocalBlogImagePath = resolveLocalBlogImagePath;
