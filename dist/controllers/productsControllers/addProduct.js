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
        const { name, measurement, quantity, price, expiry, restock_alert, } = request.body;
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
 * /products/create:
 *   post:
 *     summary: Create a product
 *     description: Adds a new product to the authenticated user's inventory. Accepts optional metadata and an image upload.
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
 *             required:
 *               - name
 *               - quantity
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name.
 *               measurement:
 *                 type: string
 *                 description: Measurement descriptor (e.g. kg, liters).
 *               quantity:
 *                 type: number
 *                 description: Quantity available.
 *               price:
 *                 type: number
 *                 description: Unit price for the product.
 *               expiry:
 *                 type: string
 *                 format: date
 *                 description: Optional expiry date.
 *               restock_alert:
 *                 type: number
 *                 description: Threshold to trigger restock alerts.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional product image upload.
 *     responses:
 *       200:
 *         description: Product created successfully.
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while creating the product.
 */
