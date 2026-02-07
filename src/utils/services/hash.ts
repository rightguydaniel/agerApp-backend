import crypto from "crypto";

export const hashEmail = (email: string) => {
  const secret = process.env.APP_SECRET || "agerapp";
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase()}|${secret}`)
    .digest("hex");
};
