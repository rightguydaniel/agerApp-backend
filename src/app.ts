import express, { NextFunction, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import { json, text, urlencoded } from "body-parser";
import { database } from "./configs/database/database";
import indexRoutes from "./routes/indexRoutes";

const app = express();

dotenv.config();
app.use(json({ strict: false }));
app.use(text());
app.use(urlencoded({ extended: true }));

app.use(logger("dev"));
app.use(cookieParser());
app.use(cors());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/v1", indexRoutes);
app.get("/", (request: Request, response: Response) => {
  response.redirect("/v1");
});

//add a logo with name favicon.ico to public folder and uncomment the line below to serve favicon
// app.use(serveFavicon(path.join(__dirname, "../public", "favicon.ico")));

database
  .sync({})
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err: HttpError) => {
    console.log(err);
  });

app.listen(process.env.PORT, () => {
  console.log(`server running on ${process.env.PORT}`);
});

export default app;
