import { DataTypes, Model } from "sequelize";
import { database } from "../configs/database/database";

export interface ProductsAttributes {
  id: string;
  owner_id: string;
  image: string[] | null;
  name: string;
  measurement: string;
  quantity: number;
  quantity_type?: string;
  price: number;
  expiry_date?: Date;
  restock_alert?: number;
  number_of_restocks: number;
}

export class Products extends Model<ProductsAttributes> {
  [x: string]: any;
}

Products.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    owner_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    measurement: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restock_alert: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    number_of_restocks: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize: database,
    tableName: "Products",
    timestamps: true,
  }
);

export default Products;
