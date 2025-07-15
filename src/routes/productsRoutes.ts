import express from "express";
import upload from "../middleware/upload";
import { addProduct } from "../controllers/productsControllers/addProduct";
import { editProduct } from "../controllers/productsControllers/editProduct";
import { deleteProduct } from "../controllers/productsControllers/deleteProduct";
import { userAuth } from "../middleware/userAuth";

const productsRoutes = express.Router();
productsRoutes.post(
  "/create",
  userAuth,
  upload.fields([{ name: "image", maxCount: 1 }]),
  addProduct
);
productsRoutes.put(
  "/edit/:id",
  userAuth,
  upload.fields([{ name: "image", maxCount: 1 }]),
  editProduct
);
productsRoutes.delete("/delete/:id", userAuth, deleteProduct);

export default productsRoutes;
