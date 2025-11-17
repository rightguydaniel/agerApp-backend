import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface CommunitiesAttributes {
  id: string;
  name: string;
  state?: string;
  country?: string;
  description?: string;
  whatsapp_link?: string;
  picture?: Buffer | null;
  phone_number?: string;
  email?: string;
  instagram_link?: string;
  facebook_link?: string;
  created_by: string;
}

type CommunitiesCreationAttributes = Optional<
  CommunitiesAttributes,
  | "id"
  | "state"
  | "country"
  | "description"
  | "whatsapp_link"
  | "picture"
  | "phone_number"
  | "email"
  | "instagram_link"
  | "facebook_link"
>;

export class Communities
  extends Model<CommunitiesAttributes, CommunitiesCreationAttributes>
  implements CommunitiesAttributes
{
  public id!: string;
  public name!: string;
  public state!: string;
  public country!: string;
  public description!: string;
  public whatsapp_link!: string;
  public picture!: Buffer | null;
  public phone_number!: string;
  public email!: string;
  public instagram_link!: string;
  public facebook_link!: string;
  public created_by!: string;
}

Communities.init(
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
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    whatsapp_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    picture: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
      defaultValue: null,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    instagram_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "Communities",
    timestamps: true,
  }
);

export default Communities;

