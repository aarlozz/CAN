import express from "express";
import {
  getInstitutionDashboard,
  completeInstitutionProfile,
  updateInstitutionProfile,
  uploadLogo,
  deleteLogo,
  verifyInstitution,
} from "../controllers/InstitutionProfileController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import logoUpload from "../middleware/logoUpload.js";

const router = express.Router();

// ── Institution dashboard ─────────────────────────────────────────────────────
router.get(
  "/dashboard-institution",
  protect,
  requireRole("institution"),
  getInstitutionDashboard
);

// ── Profile ──────────────────────────────────────────────────────────────────
router.put(
  "/profile",
  protect,
  requireRole("institution"),
  updateInstitutionProfile
);

// ── Institution logo (separate from the user's personal avatar) ─────────────
router.post(
  "/logo",
  protect,
  requireRole("institution"),
  logoUpload.single("logo"),
  uploadLogo
);
router.delete("/logo", protect, requireRole("institution"), deleteLogo);

// ── Verification (admin only) ─────────────────────────────────────────────────
router.patch(
  "/verify/:institutionId",
  protect,
  requireRole("province_admin", "super_admin"),
  verifyInstitution
);

export default router;