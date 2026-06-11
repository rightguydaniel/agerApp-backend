import express from "express";
import { getTestimonials } from "../controllers/testimonialControllers/getTestimonials";

const testimonialRoutes = express.Router();

testimonialRoutes.get("/", getTestimonials);

export default testimonialRoutes;
