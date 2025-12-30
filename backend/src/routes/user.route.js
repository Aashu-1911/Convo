import express from "express";
import { protectRoute } from "../controllers/auth.controller.js";
import { getRecommendedUsers,getMyFriends } from "../controllers/user.controller.js";
import { get } from "mongoose";


const router = express.Router();

router.use(protectRoute);// Apply authentication middleware to all routes

router.get("/", getRecommendedUsers);
router.get("/friends",getMyFriends);

router.post("/friend-requests/:id", sendFriendRequest);
router.put("/friend-requests/:id/accept", acceptFriendRequest);

router.get("/friend-requests",getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;