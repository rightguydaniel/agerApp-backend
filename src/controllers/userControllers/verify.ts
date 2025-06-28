import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import Tokens from "../../models/Tokens";
import Users from "../../models/Users";

export const verifyUser = async (request: Request, response: Response) => {
  const { email, otp } = request.body;
  try {
    const otpExist = await Tokens.findOne({ where: { email, token: otp } });
    if (otpExist) {
      sendResponse(response, 400, "Incorrect OTP");
      return;
    }
    await Users.update({ isVerified: true }, { where: { email } });
    sendResponse(response, 200, "OTP verified");
    return;
  } catch (error: any) {
    sendResponse(response, 500, "Internal Server Error", error.message);
    return;
  }
};
