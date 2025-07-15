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
exports.editProduct = void 0;
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const Products_1 = __importDefault(require("../../models/Products"));
const editProduct = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.user.id;
    const productId = request.params.id;
    const { name, measurement, quantity, quantity_type, price, expiry, restock_alert, } = request.body;
    try {
        if (!productId) {
            (0, sendResponse_1.default)(response, 400, "Product Id is missing");
            return;
        }
        const product = yield Products_1.default.findOne({
            where: { owner_id: userId, id: productId },
        });
        if (!product) {
            (0, sendResponse_1.default)(response, 400, "Product not found");
            return;
        }
        const updateProduct = yield Products_1.default.update({
            name: name ? name : product.name,
            measurement: measurement ? measurement : product.measurement,
            quantity: quantity ? quantity : product.quantity,
            quantity_type: quantity_type ? quantity_type : product.quantity_type,
            price: price ? price : product.price,
            expiry_date: expiry ? expiry : product.expiry_date,
            restock_alert: restock_alert ? restock_alert : product.restock_alert,
        }, { where: { owner_id: userId, id: productId } });
        (0, sendResponse_1.default)(response, 200, "Product Updated");
        return;
    }
    catch (error) {
        console.log("Error in editProduct", error.message);
        (0, sendResponse_1.default)(response, 500, "Internal Server Error", error.message);
        return;
    }
});
exports.editProduct = editProduct;
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Edit an existing product
 *     description: Updates the details of a product owned by the authenticated user.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to be updated.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: The updated product details.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the product.
 *             measurement:
 *               type: string
 *               description: The measurement unit of the product.
 *             quantity:
 *               type: number
 *               description: The quantity of the product.
 *             quantity_type:
 *               type: string
 *               description: The type of quantity (e.g., kg, liters).
 *             price:
 *               type: number
 *               description: The price of the product.
 *             expiry:
 *               type: string
 *               format: date
 *               description: The expiry date of the product.
 *             restock_alert:
 *               type: number
 *               description: The threshold for restock alerts.
 *     responses:
 *       200:
 *         description: Product successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Updated
 *       400:
 *         description: Bad request, such as missing product ID or product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Id is missing
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
