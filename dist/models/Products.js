"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../configs/database/database");
class Products extends sequelize_1.Model {
}
exports.Products = Products;
Products.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    owner_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.BLOB("long"),
        allowNull: true,
        defaultValue: null,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    measurement: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    quantity_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    expiry_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    restock_alert: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    number_of_restocks: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize: database_1.database,
    tableName: "Products",
    timestamps: true,
});
exports.default = Products;
