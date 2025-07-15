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
exports.deleteProduct = void 0;
const sendResponse_1 = __importDefault(require("../../utils/http/sendResponse"));
const Products_1 = __importDefault(require("../../models/Products"));
const deleteProduct = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.user.id;
    const productId = request.params.id;
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
        yield Products_1.default.destroy({
            where: { owner_id: userId, id: productId },
        });
        (0, sendResponse_1.default)(response, 200, "Product Deleted");
        return;
    }
    catch (error) {
        console.log("Error in deleteProduct:", error.message);
        (0, sendResponse_1.default)(response, 500, "Internal Server Error", error.message);
        return;
    }
});
exports.deleteProduct = deleteProduct;
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a product owned by the authenticated user based on the provided product ID.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Deleted
 *       400:
 *         description: Bad request due to missing or invalid product ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Id is missing
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
