import express from "express";
import { signUp } from "../controllers/userControllers/signUp";
import { signIn } from "../controllers/userControllers/signIn";
import { getProfile } from "../controllers/userControllers/getProfile";
import { verifyUser } from "../controllers/userControllers/verify";
import { createAdmin } from "../controllers/userControllers/createAdmin";
import { userAuth } from "../middleware/userAuth";

const userRoutes = express.Router();
userRoutes.post("/register", signUp);
userRoutes.post("/login", signIn);
userRoutes.post("/verify", verifyUser);
userRoutes.post("/admin/create", createAdmin);
userRoutes.get("/profile", userAuth, getProfile);

export default userRoutes;
