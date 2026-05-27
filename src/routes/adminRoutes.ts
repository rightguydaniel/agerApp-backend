import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { getStats } from "../controllers/adminControllers/getStats";
import { getUsers } from "../controllers/adminControllers/getUsers";
import { getUserById } from "../controllers/adminControllers/getUserById";
import { updateUser } from "../controllers/adminControllers/updateUser";
import { blockUser } from "../controllers/adminControllers/blockUser";
import { deleteUser } from "../controllers/adminControllers/deleteUser";

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

export default adminRoutes;
