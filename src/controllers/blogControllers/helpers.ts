import { Op } from "sequelize";
import BlogPost from "../../models/BlogPost";
import Users from "../../models/Users";
import { slugify } from "../../utils/services/slug";

export const generateUniqueSlug = async (
  title: string,
  excludeId?: string
) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  const buildWhere = (currentSlug: string) => {
    if (excludeId) {
      return {
        slug: currentSlug,
        id: {
          [Op.ne]: excludeId,
        },
      };
    }
    return { slug: currentSlug };
  };

  while (await BlogPost.findOne({ where: buildWhere(slug) })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

export const getAuthorDisplayName = (user: Users) => {
  const details = user.get();
  return (
    (details.full_name as string | null | undefined) ||
    (details.userName as string | null | undefined) ||
    (details.email as string | null | undefined) ||
    "Unknown"
  );
};
