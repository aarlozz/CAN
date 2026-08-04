import express from "express";
import {
  listMyCourses,
  getCourseCatalog,
  addCoursesBulk,
  removeCourse,
} from "../controllers/courseController.js";
// ⚠️ Adjust this import path/name to match your actual auth middleware.
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/courses", protect, requireRole("institution"), listMyCourses);
router.get("/courses/catalog", protect, requireRole("institution"), getCourseCatalog);
router.post("/courses/bulk", protect, requireRole("institution"), addCoursesBulk);
router.delete("/courses/:courseId", protect, requireRole("institution"), removeCourse);

export default router;