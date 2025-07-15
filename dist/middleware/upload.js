"use strict";
// middlewares/upload.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // ⬅ store in memory
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") ||
            file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(new Error("Only image and PDF files are allowed"), false);
        }
    },
});
exports.default = upload;
