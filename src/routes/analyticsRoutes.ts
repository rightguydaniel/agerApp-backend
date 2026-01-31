import express from "express";
import { userAuth } from "../middleware/userAuth";
import { getInvoiceAnalytics } from "../controllers/analyticsControllers/getInvoiceAnalytics";
import { getStoreStats } from "../controllers/analyticsControllers/getStoreStats";

const analyticsRoutes = express.Router();

analyticsRoutes.get("/invoices", userAuth, getInvoiceAnalytics);
analyticsRoutes.get("/store", userAuth, getStoreStats);

export default analyticsRoutes;
