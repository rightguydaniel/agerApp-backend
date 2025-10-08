"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadsRoot = path_1.default.join(__dirname, "../../uploads");
const blogUploadsDir = path_1.default.join(uploadsRoot, "blogs");
if (!fs_1.default.existsSync(blogUploadsDir)) {
    fs_1.default.mkdirSync(blogUploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, blogUploadsDir);
    },
    filename: (_request, file, callback) => {
        const fileExt = path_1.default.extname(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${uniqueSuffix}${fileExt}`);
    },
});
const blogUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        if (file.mimetype.startsWith("image/")) {
            callback(null, true);
            return;
        }
        callback(new Error("Only image files are allowed"));
    },
});
exports.default = blogUpload;
