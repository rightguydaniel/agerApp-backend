import { Router } from "express";
import { submitContactForm } from "../controllers/contactController";

const contactRoutes = Router();

contactRoutes.post("/", submitContactForm);

export default contactRoutes;
