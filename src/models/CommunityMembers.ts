import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../configs/database/database";

export interface CommunityMembersAttributes {
  id: string;
  community_id: string;
  user_id: string;
}

type CommunityMembersCreationAttributes = Optional<
  CommunityMembersAttributes,
  "id"
>;

export class CommunityMembers
  extends Model<CommunityMembersAttributes, CommunityMembersCreationAttributes>
  implements CommunityMembersAttributes
{
  public id!: string;
  public community_id!: string;
  public user_id!: string;
}

CommunityMembers.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    community_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "CommunityMembers",
    timestamps: true,
  }
);

export default CommunityMembers;

