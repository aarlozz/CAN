import express from "express";
import {
  listMyCourses,
  addCourse,
  updateCourse,
  removeCourse,
} from "../controllers/courseController.js";
// ⚠️ Adjust this import path/name to match your actual auth middleware.
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/courses", protect, requireRole("institution"), listMyCourses);
router.post("/courses", protect, requireRole("institution"), addCourse);
router.put("/courses/:courseId", protect, updateCourse);
router.delete("/courses/:courseId", protect, requireRole("institution"), removeCourse);

export default router;