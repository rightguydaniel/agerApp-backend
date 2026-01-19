import express from "express";
import productUpload from "../middleware/productUpload";
import { addProduct } from "../controllers/productsControllers/addProduct";
import { editProduct } from "../controllers/productsControllers/editProduct";
import { deleteProduct } from "../controllers/productsControllers/deleteProduct";
import { getUserProducts } from "../controllers/productsControllers/getUserProducts";
import { getUserProductsById } from "../controllers/productsControllers/getUserProductsById";
import { restockProduct } from "../controllers/productsControllers/restockProduct";
import { getRestockHistory } from "../controllers/productsControllers/getRestockHistory";
import { userAuth } from "../middleware/userAuth";

const productsRoutes = express.Router();
productsRoutes.post(
  "/create",
  userAuth,
  productUpload.fields([{ name: "image", maxCount: 5 }]),
  addProduct
);
productsRoutes.put(
  "/edit/:id",
  userAuth,
  productUpload.fields([{ name: "image", maxCount: 5 }]),
  editProduct
);
productsRoutes.delete("/delete/:id", userAuth, deleteProduct);
productsRoutes.get("/my", userAuth, getUserProducts);
productsRoutes.get("/user/:id", userAuth, getUserProductsById);
productsRoutes.post("/restock/:id", userAuth, restockProduct);
productsRoutes.get("/restock-history", userAuth, getRestockHistory);

export default productsRoutes;
