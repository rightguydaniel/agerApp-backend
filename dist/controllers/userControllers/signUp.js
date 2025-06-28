"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.signUp = void 0;
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const Users_1 = __importStar(require("../../models/Users"));
const uuid_1 = require("uuid");
const password_1 = require("../../utils/services/password");
const emailConfig_1 = require("../../configs/email/emailConfig");
const otp_1 = require("../../utils/services/otp");
const Tokens_1 = __importDefault(require("../../models/Tokens"));
const signUp = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, phone, country, businessName, businessCategory, password, } = request.body;
    try {
        if (!fullName || !email || phone) {
            (0, sendResponse_1.default)(response, 400, "Missing fields", null);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            (0, sendResponse_1.default)(response, 400, "Invalid email format", null);
            return;
        }
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        const newUser = yield Users_1.default.create({
            id: (0, uuid_1.v4)(),
            full_name: fullName,
            email,
            phone,
            role: Users_1.userRole.USER,
            country,
            business_name: businessName,
            business_category: businessCategory,
            password: hashedPassword,
            isVerified: false,
        });
        const otp = (0, otp_1.generateOtp)();
        yield Tokens_1.default.create({
            id: (0, uuid_1.v4)(),
            email,
            token: otp,
        });
        yield (0, emailConfig_1.sendEmail)(email, "AgerApp Registration", `Your registration OTP code is ${otp}`);
        (0, sendResponse_1.default)(response, 200, `OTP sent to ${email}`);
        return;
    }
    catch (error) {
        (0, sendResponse_1.default)(response, 500, "Internale Server Error", error.message);
        return;
    }
});
exports.signUp = signUp;
/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint allows a new user to sign up by providing their details. An OTP will be sent to the user's email for verification.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - country
 *               - businessName
 *               - businessCategory
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The full name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *               country:
 *                 type: string
 *                 description: The country of the user.
 *               businessName:
 *                 type: string
 *                 description: The name of the user's business.
 *               businessCategory:
 *                 type: string
 *                 description: The category of the user's business.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password for the user's account.
 *     responses:
 *       200:
 *         description: OTP sent to the user's email for verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: OTP sent to user@example.com
 *       400:
 *         description: Missing or invalid fields in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing fields
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
