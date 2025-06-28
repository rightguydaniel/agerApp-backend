"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokens = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../configs/database/database");
class Tokens extends sequelize_1.Model {
}
exports.Tokens = Tokens;
Tokens.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    telephone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: database_1.database,
    tableName: "Tokens",
    timestamps: false,
});
exports.default = Tokens;
