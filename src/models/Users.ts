import { DataTypes, Model } from "sequelize";
import { database } from "../configs/database/database";

export enum userRole {
  ADMIN = "admin",
  USER = "user",
}

export interface UsersAttributes {
  id: string;
  full_name: string;
  userName?: string;
  email: string;
  phone?: string;
  picture?: string;
  role: string;
  country?: string;
  business_name: string;
  business_category: string;
  password: string;
  isVerified: boolean;
  isBlocked?: Date | null;
}

export class Users extends Model<UsersAttributes> {
  [x: string]: any;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: userRole.USER,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    business_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    business_category: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      validate: {
        isDate: true,
      },
    },
  },
  {
    sequelize: database,
    tableName: "Users",
    timestamps: true,
  }
);

export default Users;
