import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface AccountDeletionTokenAttributes {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: Date;
}

type AccountDeletionTokenCreationAttributes = Optional<
  AccountDeletionTokenAttributes,
  "id"
>;

export class AccountDeletionTokens
  extends Model<
    AccountDeletionTokenAttributes,
    AccountDeletionTokenCreationAttributes
  >
  implements AccountDeletionTokenAttributes
{
  public id!: string;
  public user_id!: string;
  public email!: string;
  public token!: string;
  public expires_at!: Date;
}

AccountDeletionTokens.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "AccountDeletionTokens",
    timestamps: true,
  }
);

export default AccountDeletionTokens;
