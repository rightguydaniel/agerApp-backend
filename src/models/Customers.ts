import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface CustomersAttributes {
  id: string;
  owner_id: string;
  user_id?: string | null;
  name: string;
  phone_number: string;
  location: string;
  email: string;
}

type CustomersCreationAttributes = Optional<CustomersAttributes, "id">;

export class Customers
  extends Model<CustomersAttributes, CustomersCreationAttributes>
  implements CustomersAttributes
{
  public id!: string;
  public owner_id!: string;
  public user_id!: string | null;
  public name!: string;
  public phone_number!: string;
  public location!: string;
  public email!: string;
}

Customers.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize: database,
    tableName: "Customers",
    timestamps: true,
  }
);

export default Customers;
