import { Request, Response } from "express";
import { v4 } from "uuid";
import sendResponse from "../../utils/http/sendResponse";
import Users, { userRole } from "../../models/Users";
import { hashPassword } from "../../utils/services/password";

export const createAdmin = async (request: Request, response: Response) => {
  try {
    const {
      secret,
      fullName,
      email,
      phone,
      password,
      country,
      businessName,
      businessCategory,
    } = request.body;
    console.log("Request body:", request.body);
    const adminSecret = process.env.ADMIN_CREATION_SECRET;
    if (!adminSecret) {
      sendResponse(
        response,
        500,
        "Admin creation is not configured on this server"
      );
      return;
    }

    if (!secret || secret !== adminSecret) {
      sendResponse(response, 403, "Unauthorized request");
      return;
    }

    if (!fullName || !email || !password) {
      sendResponse(response, 400, "fullName, email, and password are required");
      return;
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      sendResponse(response, 409, "A user with this email already exists");
      return;
    }

    const hashedPassword = await hashPassword(password);
    const adminUser = await Users.create({
      id: v4(),
      full_name: fullName,
      email,
      phone: phone || null,
      role: userRole.ADMIN,
      country: country || null,
      business_name: businessName || null,
      business_category: businessCategory || null,
      password: hashedPassword,
      isVerified: true,
    });

    const createdAdmin = adminUser.get({ plain: true });
    delete (createdAdmin as { password?: string }).password;

    sendResponse(response, 200, "Admin account created", createdAdmin);
  } catch (error: any) {
    console.error("Error creating admin user", error.message);
    sendResponse(response, 500, "Failed to create admin", error.message);
  }
};
