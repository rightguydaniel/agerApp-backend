"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = exports.userRole = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../configs/database/database");
var userRole;
(function (userRole) {
    userRole["ADMIN"] = "admin";
    userRole["USER"] = "user";
})(userRole || (exports.userRole = userRole = {}));
class Users extends sequelize_1.Model {
}
exports.Users = Users;
Users.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
    },
    full_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userName: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    picture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: userRole.USER,
        allowNull: false,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    business_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    business_category: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isBlocked: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
            isDate: true,
        },
    },
}, {
    sequelize: database_1.database,
    tableName: "Users",
    timestamps: true,
});
exports.default = Users;
