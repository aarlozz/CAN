import express from "express";
import {
  getStudentDashboard,
  getStudentApplications,
  updateEducation,
  updateReservation,
  addDocument,
  removeDocument,
  completeProfile,
} from "../controllers/StudentProfileController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get(
  "/dashboard-student",
  protect,
  requireRole("student"),
  getStudentDashboard
);
// ── My Applications ─────────────────────────────────────────────────────────────────
router.get(
  "/my-applications",
  protect,
  requireRole("student"),
  getStudentApplications
);

// ── Profile sections ──────────────────────────────────────────────────────────
router.patch(
  "/education",
  protect,
  requireRole("student"),
  updateEducation
);

router.patch(
  "/reservation",
  protect,
  requireRole("student"),
  updateReservation
);

// ── Documents ─────────────────────────────────────────────────────────────────
router.post(
  "/documents",
  protect,
  requireRole("student"),
  addDocument
);

router.delete(
  "/documents/:docId",
  protect,
  requireRole("student"),
  removeDocument
);

router.put(
  "/complete-profile",
  protect,
  requireRole("student"),
  completeProfile
);

export default router;
