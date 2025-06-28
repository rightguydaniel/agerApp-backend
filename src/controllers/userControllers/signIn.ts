import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users from "../../models/Users";
import { verifyPassword } from "../../utils/services/password";
import { generateToken } from "../../utils/services/token";

export const signIn = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  try {
    if (!email) {
      sendResponse(response, 400, "Email is required to login");
    }
    if (!password) {
      sendResponse(response, 400, "Password is required to login");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendResponse(response, 400, "Invalid email format", null);
      return;
    }
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      sendResponse(response, 400, `Account with ${email} dose not exist`);
    }
    const isPasswordValid = await verifyPassword(password, user?.password);
    if (!isPasswordValid) {
      return sendResponse(response, 400, "Incorrect password");
    }
    const data = { id: user?.id, email: user?.email, role: user?.role };

    const token = generateToken(data);
    sendResponse(response, 200, "Login successful", {
      user: { ...user?.get(), password: undefined },
      token,
    });
  } catch (error: any) {
    console.log(error.message);
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};
