import express from "express";
import {
  applyForScholarship,
  getMyApplications,
  getInstitutionApplications,
  getApplicationById,
  reviewApplication,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── FIX: all named routes before /:id ────────────────────────────────────────

// Student
router.post("/apply", protect, requireRole("student"), applyForScholarship);
router.get("/my",     protect, requireRole("student"), getMyApplications);

// Institution
router.get("/institution", protect, requireRole("institution"), getInstitutionApplications);

// Param routes last
router.get("/:id",         protect, requireRole("student", "institution"), getApplicationById);
router.patch("/:id/review",   protect, requireRole("institution"), reviewApplication);
router.patch("/:id/withdraw", protect, requireRole("student"),     withdrawApplication);

export default router;
