import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import { normalizeNigerianPhoneNumber } from "../../utils/services/normalizeNigerianPhoneNumber";

export const normalizeUserContacts = async (
  _request: Request,
  response: Response
) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "email", "phone"],
    });

    if (users.length === 0) {
      sendResponse(response, 200, "No users found", {
        scanned: 0,
        updated: 0,
        skipped: 0,
      });
      return;
    }

    const existingEmails = new Map<string, string>();
    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase();
      if (!existingEmails.has(normalizedEmail)) {
        existingEmails.set(normalizedEmail, user.id);
      }
    }

    let updated = 0;
    let skipped = 0;
    const skippedUsers: Array<{
      id: string;
      reason: string;
    }> = [];

    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase();
      const normalizedPhone = user.phone
        ? normalizeNigerianPhoneNumber(user.phone)
        : user.phone;

      if (user.phone && !normalizedPhone) {
        skipped += 1;
        skippedUsers.push({
          id: user.id,
          reason: "Phone number has fewer than 10 digits",
        });
        continue;
      }

      const emailOwnerId = existingEmails.get(normalizedEmail);
      if (emailOwnerId && emailOwnerId !== user.id) {
        skipped += 1;
        skippedUsers.push({
          id: user.id,
          reason: `Lowercased email conflicts with user ${emailOwnerId}`,
        });
        continue;
      }

      const nextPhone = normalizedPhone ?? null;
      const hasChanges =
        user.email !== normalizedEmail || (user.phone ?? null) !== nextPhone;

      if (!hasChanges) {
        continue;
      }

      await user.update({
        email: normalizedEmail,
        phone: nextPhone,
      });
      updated += 1;
      existingEmails.set(normalizedEmail, user.id);
    }

    sendResponse(response, 200, "User contacts normalized", {
      scanned: users.length,
      updated,
      skipped,
      skippedUsers,
    });
    return;
  } catch (error: any) {
    console.error("Error normalizing user contacts:", error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};
