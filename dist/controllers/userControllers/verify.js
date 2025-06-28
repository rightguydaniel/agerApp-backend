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
exports.verifyUser = void 0;
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const Tokens_1 = __importDefault(require("../../models/Tokens"));
const Users_1 = __importDefault(require("../../models/Users"));
const verifyUser = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = request.body;
    try {
        const otpExist = yield Tokens_1.default.findOne({ where: { email, token: otp } });
        if (otpExist) {
            (0, sendResponse_1.default)(response, 400, "Incorrect OTP");
            return;
        }
        yield Users_1.default.update({ isVerified: true }, { where: { email } });
        (0, sendResponse_1.default)(response, 200, "OTP verified");
        return;
    }
    catch (error) {
        (0, sendResponse_1.default)(response, 500, "Internal Server Error", error.message);
        return;
    }
});
exports.verifyUser = verifyUser;
/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verify a user's OTP and update their verification status.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email.
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified"
 *       400:
 *         description: Incorrect OTP provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incorrect OTP"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */
