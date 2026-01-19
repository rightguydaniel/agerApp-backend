import express from "express";
import { userAuth } from "../middleware/userAuth";
import { getOperationsSummary } from "../controllers/operationsControllers/getOperationsSummary";

const operationsRoutes = express.Router();

operationsRoutes.get("/summary", userAuth, getOperationsSummary);

export default operationsRoutes;
