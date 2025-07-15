// middlewares/upload.ts

import multer from "multer";

const storage = multer.memoryStorage(); // ⬅ store in memory

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") || 
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed") as unknown as null, false);
    }
  },
});

export default upload;