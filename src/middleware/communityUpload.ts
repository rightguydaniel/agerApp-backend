import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsRoot = path.join(__dirname, "../../uploads");
const communityUploadsDir = path.join(uploadsRoot, "communities");

if (!fs.existsSync(communityUploadsDir)) {
  fs.mkdirSync(communityUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, communityUploadsDir);
  },
  filename: (_request, file, callback) => {
    const fileExt = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniqueSuffix}${fileExt}`);
  },
});

const communityUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image files are allowed"));
  },
});

export default communityUpload;
