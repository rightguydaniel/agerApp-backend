"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const token_1 = require("../utils/services/token");
const Users_1 = __importDefault(require("../models/Users"));
const userAuth = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorization = request.headers.authorization;
        if (authorization === undefined) {
            response.status(401).json({
                status: `error`,
                message: `You are not authorized to view this page`,
                errorMessage: `Token not found`,
            });
            return;
        }
        const token = authorization.split(" ");
        const mainToken = token[1];
        if (!mainToken || mainToken === "") {
            response.status(401).json({
                status: `error`,
                message: `Login required`,
                errorMessage: `Token not found`,
            });
            return;
        }
        const decode = (0, token_1.verifyToken)(mainToken);
        const user = yield Users_1.default.findOne({ where: { id: decode.id } });
        if (!user) {
            response.status(401).json({
                status: `error`,
                message: `Please check login credentials again`,
                errorMessage: `User not found`,
            });
            return;
        }
        request.user = decode;
        next();
    }
    catch (error) {
        response.status(401).json({
            status: "error",
            message: "Invalid or expired token",
            errorMessage: error.message,
        });
        return;
    }
});
exports.userAuth = userAuth;
