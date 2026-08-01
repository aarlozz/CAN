import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const router = express.Router();

// IMPORTANT: /read-all must be defined BEFORE /:id/read
router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

export default router;