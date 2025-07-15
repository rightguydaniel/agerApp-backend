"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../middleware/upload"));
const addProduct_1 = require("../controllers/productsControllers/addProduct");
const editProduct_1 = require("../controllers/productsControllers/editProduct");
const deleteProduct_1 = require("../controllers/productsControllers/deleteProduct");
const userAuth_1 = require("../middleware/userAuth");
const productsRoutes = express_1.default.Router();
productsRoutes.post("/create", userAuth_1.userAuth, upload_1.default.fields([{ name: "image", maxCount: 1 }]), addProduct_1.addProduct);
productsRoutes.put("/edit/:id", userAuth_1.userAuth, upload_1.default.fields([{ name: "image", maxCount: 1 }]), editProduct_1.editProduct);
productsRoutes.delete("/delete/:id", userAuth_1.userAuth, deleteProduct_1.deleteProduct);
exports.default = productsRoutes;
