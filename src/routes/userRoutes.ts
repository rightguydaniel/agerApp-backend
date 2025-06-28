import express from "express";
import { signUp } from "../controllers/userControllers/signUp";
import { signIn } from "../controllers/userControllers/signIn";
import { verifyUser } from "../controllers/userControllers/verify";

const userRoutes = express.Router();
userRoutes.post("/register", signUp)
userRoutes.post("/login", signIn)
userRoutes.post("/verify", verifyUser)

export default userRoutes;
