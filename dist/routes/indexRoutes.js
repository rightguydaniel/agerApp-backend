"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const swagger_1 = require("../configs/docs/swagger");
const indexRoutes = express_1.default.Router();
indexRoutes.get("/", controllers_1.index);
indexRoutes.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
indexRoutes.use("/users", userRoutes_1.default);
exports.default = indexRoutes;
