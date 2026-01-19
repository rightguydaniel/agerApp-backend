import express from "express";
import { userAuth } from "../middleware/userAuth";
import { addCustomer } from "../controllers/customersControllers/addCustomer";
import { addCustomerFromUser } from "../controllers/customersControllers/addCustomerFromUser";
import { editCustomer } from "../controllers/customersControllers/editCustomer";
import { deleteCustomer } from "../controllers/customersControllers/deleteCustomer";
import { getCustomer } from "../controllers/customersControllers/getCustomer";
import { getCustomers } from "../controllers/customersControllers/getCustomers";

const customersRoutes = express.Router();

customersRoutes.post("/", userAuth, addCustomer);
customersRoutes.post("/user", userAuth, addCustomerFromUser);
customersRoutes.get("/", userAuth, getCustomers);
customersRoutes.get("/:id", userAuth, getCustomer);
customersRoutes.put("/:id", userAuth, editCustomer);
customersRoutes.delete("/:id", userAuth, deleteCustomer);

export default customersRoutes;
