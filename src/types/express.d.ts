import { JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
  id?: string;
  email?: string;
  role?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthPayload;
    file?: Express.Multer.File;
    files?: { [key: string]: Express.Multer.File[] } | Express.Multer.File[];
  }
}
