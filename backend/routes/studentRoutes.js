import express from "express";
import {
  getStudentDashboard,
  updateEducation,
  updateReservation,
  addDocument,
  removeDocument,
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

export default router;