import express from "express";
import {
  getInstitutionDashboard,
  completeInstitutionProfile,
  updateInstitutionProfile,
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

// ── Complete profile (Step 3 of stepwise Google signup) ────────────────────────
router.put(
  "/complete-profile",
  protect,
  requireRole("institution"),
  completeInstitutionProfile
);

// ── Profile (edit after signup) ─────────────────────────────────────────────────
router.put(
  "/profile",
  protect,
  requireRole("institution"),
  updateInstitutionProfile
);

// ── Verification (admin only) ─────────────────────────────────────────────────
router.patch(
  "/verify/:institutionId",
  protect,
  requireRole("province_admin", "super_admin"),
  verifyInstitution
);

export default router;