import { NextFunction, Request, Response } from "express";
import { userRole } from "../models/Users";
import sendResponse from "../utils/http/sendResponse";

export const requireAdmin = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const role = request.user?.role as string | undefined;

  if (!role) {
    sendResponse(response, 401, "Authentication required");
    return;
  }

  if (role !== userRole.ADMIN) {
    sendResponse(response, 403, "Admin privileges required");
    return;
  }

  next();
};
