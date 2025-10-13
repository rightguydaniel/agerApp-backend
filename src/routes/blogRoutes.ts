import express from "express";
import { listPublishedPosts, listAllPosts } from "../controllers/blogControllers/listPosts";
import { getPostBySlug } from "../controllers/blogControllers/getPostBySlug";
import { createPost } from "../controllers/blogControllers/createPost";
import { updatePost } from "../controllers/blogControllers/updatePost";
import { deletePost } from "../controllers/blogControllers/deletePost";
import blogUpload from "../middleware/blogUpload";
import { userAuth } from "../middleware/userAuth";
import { requireAdmin } from "../middleware/requireAdmin";

const blogRoutes = express.Router();

blogRoutes.get("/", listPublishedPosts);
blogRoutes.get("/admin", userAuth, requireAdmin, listAllPosts);
blogRoutes.get("/:slug", getPostBySlug);
blogRoutes.post("/", userAuth, requireAdmin, blogUpload.single("coverImage"), createPost);
blogRoutes.put("/:id", userAuth, requireAdmin, blogUpload.single("coverImage"), updatePost);
blogRoutes.delete("/:id", userAuth, requireAdmin, deletePost);

export default blogRoutes;
