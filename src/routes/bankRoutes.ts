import express from "express";
import { syncBanks } from "../controllers/bankControllers/syncBanks";
import { resolveBankAccount } from "../controllers/bankControllers/resolveBankAccount";
import { userAuth } from "../middleware/userAuth";
import { allBanks } from "../controllers/bankControllers/allBanks";

const bankRoutes = express.Router();

bankRoutes.post("/sync", syncBanks);
bankRoutes.post("/resolve", userAuth, resolveBankAccount);
bankRoutes.get("/", allBanks)

export default bankRoutes;
