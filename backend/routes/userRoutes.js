import express from "express";
import { uploadAvatar, deleteAvatar, getMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import avatarUpload from "../middleware/avatarUpload.js";

const router = express.Router();

// Lightweight identity/avatar fetch — used by the header
router.get("/me", protect, getMe);

// Any logged-in user (student or institution) can manage their own avatar
router.post("/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);

export default router;