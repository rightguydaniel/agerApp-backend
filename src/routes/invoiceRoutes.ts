import express from "express";
import { userAuth } from "../middleware/userAuth";
import { createInvoice } from "../controllers/invoiceControllers/createInvoice";
import { updateInvoice } from "../controllers/invoiceControllers/updateInvoice";
import { getCustomerInvoices } from "../controllers/invoiceControllers/getCustomerInvoices";
import { getUserInvoices } from "../controllers/invoiceControllers/getUserInvoices";

const invoiceRoutes = express.Router();

invoiceRoutes.post("/", userAuth, createInvoice);
invoiceRoutes.get("/", userAuth, getUserInvoices);
invoiceRoutes.put("/:id", userAuth, updateInvoice);
invoiceRoutes.get("/customer/:customerId", userAuth, getCustomerInvoices);

export default invoiceRoutes;
