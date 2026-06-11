import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface TestimonialAttributes {
  id: string;
  name: string;
  company: string;
  image?: string | null;
  testimonial: string;
  isVisible: boolean;
}

export type TestimonialCreationAttributes = Optional<
  TestimonialAttributes,
  "id" | "image" | "isVisible"
>;

export class Testimonial
  extends Model<TestimonialAttributes, TestimonialCreationAttributes>
  implements TestimonialAttributes
{
  public id!: string;
  public name!: string;
  public company!: string;
  public image?: string | null;
  public testimonial!: string;
  public isVisible!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Testimonial.init(
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
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    testimonial: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: database,
    tableName: "Testimonials",
    timestamps: true,
  },
);

export default Testimonial;
