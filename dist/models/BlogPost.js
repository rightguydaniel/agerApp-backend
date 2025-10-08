"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPost = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../configs/database/database");
const Users_1 = __importDefault(require("./Users"));
class BlogPost extends sequelize_1.Model {
}
exports.BlogPost = BlogPost;
BlogPost.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    excerpt: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    coverImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    authorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    authorName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isPublished: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    publishedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    views: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: database_1.database,
    tableName: "BlogPosts",
    timestamps: true,
});
BlogPost.belongsTo(Users_1.default, { foreignKey: "authorId", as: "author" });
exports.default = BlogPost;
