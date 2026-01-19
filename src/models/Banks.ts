import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface BanksAttributes {
  id: string;
  name: string;
  code: string;
  currency: string;
}

type BanksCreationAttributes = Optional<BanksAttributes, "id">;

export class Banks
  extends Model<BanksAttributes, BanksCreationAttributes>
  implements BanksAttributes
{
  public id!: string;
  public name!: string;
  public code!: string;
  public currency!: string;
}

Banks.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "Banks",
    timestamps: true,
  }
);

export default Banks;
