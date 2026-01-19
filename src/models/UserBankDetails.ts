import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface UserBankDetailsAttributes {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

type UserBankDetailsCreationAttributes = Optional<
  UserBankDetailsAttributes,
  "id"
>;

export class UserBankDetails
  extends Model<UserBankDetailsAttributes, UserBankDetailsCreationAttributes>
  implements UserBankDetailsAttributes
{
  public id!: string;
  public user_id!: string;
  public bank_name!: string;
  public account_number!: string;
  public account_name!: string;
}

UserBankDetails.init(
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
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "UserBankDetails",
    timestamps: true,
  }
);

export default UserBankDetails;
