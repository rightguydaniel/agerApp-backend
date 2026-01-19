import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface RestockHistoryAttributes {
  id: string;
  product_id: string;
  owner_id: string;
  restocked_by: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type RestockHistoryCreationAttributes = Optional<
  RestockHistoryAttributes,
  "id"
>;

export class RestockHistory
  extends Model<RestockHistoryAttributes, RestockHistoryCreationAttributes>
  implements RestockHistoryAttributes
{
  public id!: string;
  public product_id!: string;
  public owner_id!: string;
  public restocked_by!: string;
  public quantity!: number;
}

RestockHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    restocked_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "RestockHistory",
    timestamps: true,
  }
);

export default RestockHistory;
