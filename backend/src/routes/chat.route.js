import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, createChannel } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/channel", protectRoute, createChannel);

export default router;