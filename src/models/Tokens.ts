import { DataTypes, Model } from "sequelize";
import { database } from "../configs/database/database";

export interface TokensAttributes {
  id: string;
  email?: string;
  telephone?: string;
  token: string;
}

export class Tokens extends Model<TokensAttributes> {
  [x: string]: any;
}

Tokens.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: database,
    tableName: "Tokens",
    timestamps: false,
  }
);

export default Tokens;
