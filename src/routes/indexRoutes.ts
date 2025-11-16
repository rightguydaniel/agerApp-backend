import express from "express";
import { index } from "../controllers";
import userRoutes from "./userRoutes";
import blogRoutes from "./blogRoutes";
import { swaggerSpec, swaggerUi } from "../configs/docs/swagger";
import contactRoutes from "./contactRoutes";
import productsRoutes from "./productsRoutes";

const indexRoutes = express.Router();
indexRoutes.get("/", index);
indexRoutes.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
indexRoutes.use("/users", userRoutes);
indexRoutes.use("/blogs", blogRoutes);
indexRoutes.use("/contact", contactRoutes);
indexRoutes.use("/products", productsRoutes);
export default indexRoutes;
