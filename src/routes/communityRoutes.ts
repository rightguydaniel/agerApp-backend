import express from "express";
import upload from "../middleware/upload";
import { userAuth } from "../middleware/userAuth";
import { createCommunity } from "../controllers/communityControllers/createCommunity";
import { updateCommunity } from "../controllers/communityControllers/updateCommunity";
import { joinCommunity } from "../controllers/communityControllers/joinCommunity";
import { exitCommunity } from "../controllers/communityControllers/exitCommunity";
import { getCommunityMembers } from "../controllers/communityControllers/getCommunityMembers";
import { getCommunities } from "../controllers/communityControllers/getCommunities";

const communityRoutes = express.Router();

communityRoutes.get("/", userAuth, getCommunities);
communityRoutes.post(
  "/create",
  userAuth,
  upload.fields([{ name: "picture", maxCount: 1 }]),
  createCommunity
);
communityRoutes.put(
  "/edit/:id",
  userAuth,
  upload.fields([{ name: "picture", maxCount: 1 }]),
  updateCommunity
);
communityRoutes.post("/join/:id", userAuth, joinCommunity);
communityRoutes.post("/exit/:id", userAuth, exitCommunity);
communityRoutes.get("/members/:id", userAuth, getCommunityMembers);

export default communityRoutes;
