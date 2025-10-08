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
exports.getAuthorDisplayName = exports.generateUniqueSlug = void 0;
const sequelize_1 = require("sequelize");
const BlogPost_1 = __importDefault(require("../../models/BlogPost"));
const slug_1 = require("../../utils/services/slug");
const generateUniqueSlug = (title, excludeId) => __awaiter(void 0, void 0, void 0, function* () {
    const baseSlug = (0, slug_1.slugify)(title);
    let slug = baseSlug;
    let counter = 1;
    const buildWhere = (currentSlug) => {
        if (excludeId) {
            return {
                slug: currentSlug,
                id: {
                    [sequelize_1.Op.ne]: excludeId,
                },
            };
        }
        return { slug: currentSlug };
    };
    while (yield BlogPost_1.default.findOne({ where: buildWhere(slug) })) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return slug;
});
exports.generateUniqueSlug = generateUniqueSlug;
const getAuthorDisplayName = (user) => {
    const details = user.get();
    return (details.full_name ||
        details.userName ||
        details.email ||
        "Unknown");
};
exports.getAuthorDisplayName = getAuthorDisplayName;
