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
 * /products/delete/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Removes the specified product owned by the authenticated user from the inventory.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifier of the product to delete.
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       400:
 *         description: Product ID missing or product not found.
 *       401:
 *         description: Authentication token missing or invalid.
 *       500:
 *         description: Server error while deleting the product.
 */
