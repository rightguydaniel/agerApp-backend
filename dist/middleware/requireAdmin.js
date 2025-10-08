"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const Users_1 = require("../models/Users");
const sendResponse_1 = __importDefault(require("../utils/http/sendResponse"));
const requireAdmin = (request, response, next) => {
    var _a;
    const role = (_a = request.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!role) {
        (0, sendResponse_1.default)(response, 401, "Authentication required");
        return;
    }
    if (role !== Users_1.userRole.ADMIN) {
        (0, sendResponse_1.default)(response, 403, "Admin privileges required");
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
