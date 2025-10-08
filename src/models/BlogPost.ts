import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";
import Users from "./Users";

export interface BlogPostAttributes {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  authorId: string;
  authorName: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  views: number;
}

export type BlogPostCreationAttributes = Optional<
  BlogPostAttributes,
  "id" | "excerpt" | "coverImage" | "publishedAt" | "views"
>;

export class BlogPost
  extends Model<BlogPostAttributes, BlogPostCreationAttributes>
  implements BlogPostAttributes
{
  public id!: string;
  public title!: string;
  public slug!: string;
  public excerpt?: string | null;
  public content!: string;
  public coverImage?: string | null;
  public authorId!: string;
  public authorName!: string;
  public isPublished!: boolean;
  public publishedAt?: Date | null;
  public views!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BlogPost.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: database,
    tableName: "BlogPosts",
    timestamps: true,
  }
);

BlogPost.belongsTo(Users, { foreignKey: "authorId", as: "author" });

export default BlogPost;
