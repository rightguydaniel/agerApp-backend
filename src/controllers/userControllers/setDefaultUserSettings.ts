import { Response } from "express";
import { Op } from "sequelize";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import UserSettings from "../../models/UserSettings";

const DEFAULT_SETTINGS = {
  currency: "NGN",
  notification: true,
  taxes_rate: 7.5,
  taxes_enabled: true,
  language: "ENGLISH",
};

export const setDefaultUserSettings = async (_request: any, response: Response) => {
  try {
    const users = await Users.findAll({ attributes: ["id"] });
    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      sendResponse(response, 200, "No users found", {
        created: 0,
        updated: 0,
      });
      return;
    }

    const existingSettings = await UserSettings.findAll({
      where: { user_id: { [Op.in]: userIds } },
      attributes: ["user_id"],
    });
    const existingIds = new Set(existingSettings.map((setting) => setting.user_id));

    const missingIds = userIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      await UserSettings.bulkCreate(
        missingIds.map((userId) => ({
          user_id: userId,
          ...DEFAULT_SETTINGS,
        }))
      );
    }

    const [currencyUpdated] = await UserSettings.update(
      { currency: DEFAULT_SETTINGS.currency },
      { where: { currency: null } }
    );
    const [taxRateUpdated] = await UserSettings.update(
      { taxes_rate: DEFAULT_SETTINGS.taxes_rate },
      { where: { taxes_rate: null } }
    );
    const [languageUpdated] = await UserSettings.update(
      { language: DEFAULT_SETTINGS.language },
      { where: { language: null } }
    );

    sendResponse(response, 200, "Default user settings applied", {
      created: missingIds.length,
      updated: currencyUpdated + taxRateUpdated + languageUpdated,
    });
    return;
  } catch (error: any) {
    console.error("Error applying default user settings:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};