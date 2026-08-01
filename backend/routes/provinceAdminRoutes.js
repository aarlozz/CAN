import express from "express";
import {
  getInstitutionsInProvince,
  verifyInstitution,
  getScholarshipsInProvince,
  verifyScholarship,
} from "../controllers/ProvinceAdminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require province_admin role
router.use(protect, requireRole("province_admin"));

// Institutions
router.get("/institutions", getInstitutionsInProvince);
router.patch("/institutions/:id/verify", verifyInstitution);

// Scholarships
router.get("/scholarships", getScholarshipsInProvince);
router.patch("/scholarships/:id/verify", verifyScholarship);

export default router;
