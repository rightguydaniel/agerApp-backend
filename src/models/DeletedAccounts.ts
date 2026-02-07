import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface DeletedAccountsAttributes {
  id: string;
  email_hash: string;
  deleted_at: Date;
  allow_after: Date;
}

type DeletedAccountsCreationAttributes = Optional<
  DeletedAccountsAttributes,
  "id"
>;

export class DeletedAccounts
  extends Model<DeletedAccountsAttributes, DeletedAccountsCreationAttributes>
  implements DeletedAccountsAttributes
{
  public id!: string;
  public email_hash!: string;
  public deleted_at!: Date;
  public allow_after!: Date;
}

DeletedAccounts.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    email_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    allow_after: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "DeletedAccounts",
    timestamps: true,
  }
);

export default DeletedAccounts;
