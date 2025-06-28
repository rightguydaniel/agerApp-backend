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
exports.signIn = void 0;
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const Users_1 = __importDefault(require("../../models/Users"));
const password_1 = require("../../utils/services/password");
const token_1 = require("../../utils/services/token");
const signIn = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = request.body;
    try {
        if (!email) {
            (0, sendResponse_1.default)(response, 400, "Email is required to login");
        }
        if (!password) {
            (0, sendResponse_1.default)(response, 400, "Password is required to login");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            (0, sendResponse_1.default)(response, 400, "Invalid email format", null);
            return;
        }
        const user = yield Users_1.default.findOne({ where: { email } });
        if (!user) {
            (0, sendResponse_1.default)(response, 400, `Account with ${email} dose not exist`);
        }
        const isPasswordValid = yield (0, password_1.verifyPassword)(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            return (0, sendResponse_1.default)(response, 400, "Incorrect password");
        }
        const data = { id: user === null || user === void 0 ? void 0 : user.id, email: user === null || user === void 0 ? void 0 : user.email, role: user === null || user === void 0 ? void 0 : user.role };
        const token = (0, token_1.generateToken)(data);
        (0, sendResponse_1.default)(response, 200, "Login successful", {
            user: Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.get()), { password: undefined }),
            token,
        });
    }
    catch (error) {
        console.log(error.message);
        (0, sendResponse_1.default)(response, 500, "Internal Server Error", error.message);
        return;
    }
});
exports.signIn = signIn;
/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: User sign-in
 *     description: Authenticates a user with their email and password, returning a token upon successful login.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 12345
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         role:
 *                           type: string
 *                           example: user
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request. Missing or invalid email/password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required to login
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
