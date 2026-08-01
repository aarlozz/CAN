import express from "express";
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
  getMyBookmarkIds,
} from "../controllers/bookmarkController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Bookmarking scholarships is a student-only feature
router.use(protect, requireRole("student"));

// IMPORTANT: /mine-ids must be defined before any /:scholarshipId-style route
router.get("/mine-ids", getMyBookmarkIds);
router.get("/", getMyBookmarks);
router.post("/:scholarshipId", addBookmark);
router.delete("/:scholarshipId", removeBookmark);

export default router;