import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { getStats } from "../controllers/adminControllers/getStats";
import { getUsers } from "../controllers/adminControllers/getUsers";
import { getUserById } from "../controllers/adminControllers/getUserById";
import { updateUser } from "../controllers/adminControllers/updateUser";
import { blockUser } from "../controllers/adminControllers/blockUser";
import { deleteUser } from "../controllers/adminControllers/deleteUser";
import { getCommunities } from "../controllers/adminControllers/getCommunities";
import { updateCommunity } from "../controllers/adminControllers/updateCommunity";
import { deleteCommunity } from "../controllers/adminControllers/deleteCommunity";
import { getProducts } from "../controllers/adminControllers/getProducts";
import { updateProduct } from "../controllers/adminControllers/updateProduct";
import { deleteProduct } from "../controllers/adminControllers/deleteProduct";
import { createTestimonial } from "../controllers/adminControllers/createTestimonial";
import { getAllTestimonials } from "../controllers/adminControllers/getAllTestimonials";
import { updateTestimonial } from "../controllers/adminControllers/updateTestimonial";
import { deleteTestimonial } from "../controllers/adminControllers/deleteTestimonial";
import testimonialUpload from "../middleware/testimonialUpload";

const adminRoutes = Router();

// All routes require authentication and admin role
adminRoutes.use(userAuth);
adminRoutes.use(requireAdmin);

// Stats
adminRoutes.get("/stats", getStats);

// User management
adminRoutes.get("/users", getUsers);
adminRoutes.get("/users/:id", getUserById);
adminRoutes.put("/users/:id", updateUser);
adminRoutes.patch("/users/:id/block", blockUser);
adminRoutes.delete("/users/:id", deleteUser);

// Community management
adminRoutes.get("/communities", getCommunities);
adminRoutes.put("/communities/:id", updateCommunity);
adminRoutes.delete("/communities/:id", deleteCommunity);

// Product management
adminRoutes.get("/products", getProducts);
adminRoutes.put("/products/:id", updateProduct);
adminRoutes.delete("/products/:id", deleteProduct);

// Testimonial management
adminRoutes.get("/testimonials", getAllTestimonials);
adminRoutes.post(
  "/testimonials",
  testimonialUpload.single("image"),
  createTestimonial,
);
adminRoutes.put(
  "/testimonials/:id",
  testimonialUpload.single("image"),
  updateTestimonial,
);
adminRoutes.delete("/testimonials/:id", deleteTestimonial);

export default adminRoutes;
