"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signUp_1 = require("../controllers/userControllers/signUp");
const signIn_1 = require("../controllers/userControllers/signIn");
const verify_1 = require("../controllers/userControllers/verify");
const userRoutes = express_1.default.Router();
userRoutes.post("/register", signUp_1.signUp);
userRoutes.post("/login", signIn_1.signIn);
userRoutes.post("/verify", verify_1.verifyUser);
exports.default = userRoutes;
