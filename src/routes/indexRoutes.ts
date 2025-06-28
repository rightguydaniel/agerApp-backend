import express from "express";
import { index } from "../controllers";
import userRoutes from "./userRoutes";
import { swaggerSpec, swaggerUi } from "../configs/docs/swagger";

const indexRoutes = express.Router();
indexRoutes.get("/", index);
indexRoutes.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
indexRoutes.use("/users", userRoutes);

export default indexRoutes;
