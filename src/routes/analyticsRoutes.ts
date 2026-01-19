import express from "express";
import { userAuth } from "../middleware/userAuth";
import { getInvoiceAnalytics } from "../controllers/analyticsControllers/getInvoiceAnalytics";

const analyticsRoutes = express.Router();

analyticsRoutes.get("/invoices", userAuth, getInvoiceAnalytics);

export default analyticsRoutes;
