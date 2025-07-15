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
exports.addProduct = void 0;
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const Products_1 = __importDefault(require("../../models/Products"));
const uuid_1 = require("uuid");
const addProduct = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = request.user.id;
    try {
        const { name, measurement, quantity, quantity_type, price, expiry, restock_alert, } = request.body;
        const files = request.files;
        const image = (_a = files["image"]) === null || _a === void 0 ? void 0 : _a[0];
        if (!name || !quantity || !price) {
            (0, sendResponse_1.default)(response, 400, "Missing fields");
            return;
        }
        const newProduct = yield Products_1.default.create({
            id: (0, uuid_1.v4)(),
            owner_id: userId,
            image: image ? image === null || image === void 0 ? void 0 : image.buffer : null,
            name,
            measurement,
            quantity,
            quantity_type,
            price,
            expiry_date: expiry ? expiry : null,
            restock_alert: restock_alert ? restock_alert : 0,
            number_of_restocks: 1,
        });
        (0, sendResponse_1.default)(response, 200, "Product Added");
        return;
    }
    catch (error) {
        console.log("Error in addProduct:", error.message);
        (0, sendResponse_1.default)(response, 500, "Internal Server Error", error.message);
    }
});
exports.addProduct = addProduct;
/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Add a new product to the inventory.
 *     description: This endpoint allows users to add a new product to their inventory. The user must provide required fields such as name, quantity, and price. Optional fields include measurement, expiry date, restock alert, and an image file.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product.
 *                 example: "Milk"
 *               measurement:
 *                 type: string
 *                 description: Measurement unit of the product.
 *                 example: "Liters"
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product.
 *                 example: 10
 *               quantity_type:
 *                 type: string
 *                 description: Type of quantity (e.g., units, kg, liters).
 *                 example: "Liters"
 *               price:
 *                 type: number
 *                 description: Price of the product.
 *                 example: 5.99
 *               expiry:
 *                 type: string
 *                 format: date
 *                 description: Expiry date of the product.
 *                 example: "2023-12-31"
 *               restock_alert:
 *                 type: number
 *                 description: Restock alert threshold.
 *                 example: 5
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the product.
 *     responses:
 *       200:
 *         description: Product successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product Added"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing fields"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Error details"
 */
