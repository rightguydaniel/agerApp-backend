import path from "path";

const normalizeBaseUrl = (baseUrl: string) => {
  if (baseUrl.endsWith("/")) {
    return baseUrl.slice(0, -1);
  }
  return baseUrl;
};

export const getUploadsRootUrl = () => {
  const baseUrl = process.env.API_URL || "";
  if (!baseUrl) {
    return "";
  }
  return `${normalizeBaseUrl(baseUrl)}/uploads/blogs`;
};

export const buildBlogImageUrl = (filename: string) => {
  const base = getUploadsRootUrl();
  if (!base) {
    return `/uploads/blogs/${filename}`;
  }
  return `${base}/${filename}`;
};

export const resolveLocalBlogImagePath = (fileUrl: string) => {
  const uploadsPath = path.join(__dirname, "../../../uploads/blogs");
  const parts = fileUrl.split("/");
  const filename = parts[parts.length - 1];
  return path.join(uploadsPath, filename);
};
