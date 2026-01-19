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

export const getCommunityUploadsRootUrl = () => {
  const baseUrl = process.env.API_URL || "";
  if (!baseUrl) {
    return "";
  }
  return `${normalizeBaseUrl(baseUrl)}/uploads/communities`;
};

export const getProductUploadsRootUrl = () => {
  const baseUrl = process.env.API_URL || "";
  if (!baseUrl) {
    return "";
  }
  return `${normalizeBaseUrl(baseUrl)}/uploads/products`;
};

export const getUserUploadsRootUrl = () => {
  const baseUrl = process.env.API_URL || "";
  if (!baseUrl) {
    return "";
  }
  return `${normalizeBaseUrl(baseUrl)}/uploads/users`;
};

export const buildBlogImageUrl = (filename: string) => {
  const base = getUploadsRootUrl();
  if (!base) {
    return `/uploads/blogs/${filename}`;
  }
  return `${base}/${filename}`;
};

export const buildCommunityImageUrl = (filename: string) => {
  const base = getCommunityUploadsRootUrl();
  if (!base) {
    return `/uploads/communities/${filename}`;
  }
  return `${base}/${filename}`;
};

export const buildProductImageUrl = (filename: string) => {
  const base = getProductUploadsRootUrl();
  if (!base) {
    return `/uploads/products/${filename}`;
  }
  return `${base}/${filename}`;
};

export const buildUserImageUrl = (filename: string) => {
  const base = getUserUploadsRootUrl();
  if (!base) {
    return `/uploads/users/${filename}`;
  }
  return `${base}/${filename}`;
};

export const resolveLocalBlogImagePath = (fileUrl: string) => {
  const uploadsPath = path.join(__dirname, "../../../uploads/blogs");
  const parts = fileUrl.split("/");
  const filename = parts[parts.length - 1];
  return path.join(uploadsPath, filename);
};

export const resolveLocalCommunityImagePath = (fileUrl: string) => {
  const uploadsPath = path.join(__dirname, "../../../uploads/communities");
  const parts = fileUrl.split("/");
  const filename = parts[parts.length - 1];
  return path.join(uploadsPath, filename);
};

export const resolveLocalProductImagePath = (fileUrl: string) => {
  const uploadsPath = path.join(__dirname, "../../../uploads/products");
  const parts = fileUrl.split("/");
  const filename = parts[parts.length - 1];
  return path.join(uploadsPath, filename);
};

export const resolveLocalUserImagePath = (fileUrl: string) => {
  const uploadsPath = path.join(__dirname, "../../../uploads/users");
  const parts = fileUrl.split("/");
  const filename = parts[parts.length - 1];
  return path.join(uploadsPath, filename);
};
