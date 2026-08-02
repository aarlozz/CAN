import express from "express";
import {
  getInstitutionDashboard,
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

// ── Profile (NEW) ──────────────────────────────────────────────────────────────
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