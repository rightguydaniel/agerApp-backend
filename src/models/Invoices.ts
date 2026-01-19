import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface InvoiceCustomerSnapshot {
  id: string;
  name: string;
  phone_number: string;
  location: string;
  email: string;
}

export interface InvoiceProductItem {
  product_id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface InvoicesAttributes {
  id: string;
  owner_id: string;
  customer_id: string;
  customer_details: InvoiceCustomerSnapshot;
  products: InvoiceProductItem[];
  tax?: number | null;
  total?: number | null;
  narration?: string | null;
  delivery_fees?: number | null;
  auto_approve: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type InvoicesCreationAttributes = Optional<InvoicesAttributes, "id">;

export class Invoices
  extends Model<InvoicesAttributes, InvoicesCreationAttributes>
  implements InvoicesAttributes
{
  public id!: string;
  public owner_id!: string;
  public customer_id!: string;
  public customer_details!: InvoiceCustomerSnapshot;
  public products!: InvoiceProductItem[];
  public tax!: number | null;
  public total!: number | null;
  public narration!: string | null;
  public delivery_fees!: number | null;
  public auto_approve!: boolean;
}

Invoices.init(
  {
    id: {
      type: DataTypes.STRING,
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
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Customers",
        key: "id",
      },
    },
    customer_details: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    narration: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    delivery_fees: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    auto_approve: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: database,
    tableName: "Invoices",
    timestamps: true,
  }
);

export default Invoices;
