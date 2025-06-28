import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Users, { userRole } from "../../models/Users";
import { v4 } from "uuid";
import { hashPassword } from "../../utils/services/password";
import { sendEmail } from "../../configs/email/emailConfig";
import { generateOtp } from "../../utils/services/otp";
import Tokens from "../../models/Tokens";

export const signUp = async (request: Request, response: Response) => {
  const {
    fullName,
    email,
    phone,
    country,
    businessName,
    businessCategory,
    password,
  } = request.body;
  try {
    if (!fullName || !email || phone) {
      sendResponse(response, 400, "Missing fields", null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendResponse(response, 400, "Invalid email format", null);
      return;
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await Users.create({
      id: v4(),
      full_name: fullName,
      email,
      phone,
      role: userRole.USER,
      country,
      business_name: businessName,
      business_category: businessCategory,
      password: hashedPassword,
      isVerified: false,
    });
    const otp = generateOtp();
    await Tokens.create({
      id: v4(),
      email,
      token: otp,
    });
    await sendEmail(
      email,
      "AgerApp Registration",
      `Your registration OTP code is ${otp}`
    );
    sendResponse(response, 200, `OTP sent to ${email}`)
    return
  } catch (error: any) {
    sendResponse(response, 500, "Internale Server Error", error.message);
    return;
  }
};
