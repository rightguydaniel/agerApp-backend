import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface UserSettingsAttributes {
  id: string;
  user_id: string;
  currency: string | null;
  notification: boolean;
  taxes_rate: number | null;
  taxes_enabled: boolean;
  language: string | null;
}

type UserSettingsCreationAttributes = Optional<UserSettingsAttributes, "id">;

export class UserSettings
  extends Model<UserSettingsAttributes, UserSettingsCreationAttributes>
  implements UserSettingsAttributes
{
  public id!: string;
  public user_id!: string;
  public currency!: string | null;
  public notification!: boolean;
  public taxes_rate!: number | null;
  public taxes_enabled!: boolean;
  public language!: string | null;
}

UserSettings.init(
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
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    notification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    taxes_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    taxes_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: database,
    tableName: "UserSettings",
    timestamps: true,
  }
);

export default UserSettings;
