"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = exports.swaggerUi = void 0;
// src/configs/docs/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CPlynk API Documentation",
            version: "2.0.0",
            description: "This is the API documentation for the CPlynk API.",
        },
        servers: [
            {
                url: `${process.env.APP_DOMAIN}/v1`,
                description: `${((_a = process.env.APP_DOMAIN) === null || _a === void 0 ? void 0 : _a.includes("http://localhost")) ? "Development" : "Production"} server`,
            },
        ],
    },
    apis: ["./dist/routes/*.js", "./dist/controllers/**/*.js"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerSpec = swaggerSpec;
