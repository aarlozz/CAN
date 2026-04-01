import express from "express";
import {
  getInstitutionDashboard,
  addCourse,
  removeCourse,
  verifyInstitution,
} from "../controllers/InstitutionProfileController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Institution dashboard ─────────────────────────────────────────────────────
router.get(
  "/dashboard-institution",
  protect,
  requireRole("institution"),
  getInstitutionDashboard
);

// ── Course management ─────────────────────────────────────────────────────────
router.post(
  "/courses",
  protect,
  requireRole("institution"),
  addCourse
);

router.delete(
  "/courses/:courseId",
  protect,
  requireRole("institution"),
  removeCourse
);

// ── Verification (admin only) ─────────────────────────────────────────────────
router.patch(
  "/verify/:institutionId",
  protect,
  requireRole("province_admin", "super_admin"),
  verifyInstitution
);

export default router;