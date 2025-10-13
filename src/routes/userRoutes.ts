import express from "express";
import { signUp } from "../controllers/userControllers/signUp";
import { signIn } from "../controllers/userControllers/signIn";
import { verifyUser } from "../controllers/userControllers/verify";
import { createAdmin } from "../controllers/userControllers/createAdmin";

const userRoutes = express.Router();
userRoutes.post("/register", signUp)
userRoutes.post("/login", signIn)
userRoutes.post("/verify", verifyUser)
userRoutes.post("/admin/create", createAdmin)

export default userRoutes;
