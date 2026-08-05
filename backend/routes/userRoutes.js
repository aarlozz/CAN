// routes/userRoutes.js

import express from "express";
import { uploadUserAvatar, deleteUserAvatar } from "../controllers/userController.js";
import { uploadAvatar } from "../middleware/uploadAvatar.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect MUST run before uploadAvatar.single(...) — the multer storage
// config in uploadAvatar.js reads req.user.id to build the per-user folder.
router.post("/avatar", protect, uploadAvatar.single("avatar"), uploadUserAvatar);
router.delete("/avatar", protect, deleteUserAvatar);

export default router;