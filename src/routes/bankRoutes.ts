import express from "express";
import { syncBanks } from "../controllers/bankControllers/syncBanks";
import { resolveBankAccount } from "../controllers/bankControllers/resolveBankAccount";
import { userAuth } from "../middleware/userAuth";

const bankRoutes = express.Router();

bankRoutes.post("/sync", syncBanks);
bankRoutes.post("/resolve", userAuth, resolveBankAccount);

export default bankRoutes;
