import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsRoot = path.join(__dirname, "../../uploads");
const blogUploadsDir = path.join(uploadsRoot, "blogs");

if (!fs.existsSync(blogUploadsDir)) {
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, blogUploadsDir);
  },
  filename: (_request, file, callback) => {
    const fileExt = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniqueSuffix}${fileExt}`);
  },
});

const blogUpload = multer({
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

export default blogUpload;
