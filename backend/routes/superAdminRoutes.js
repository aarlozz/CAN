import express from "express";
import {
  createProvinceAdmin,
  toggleProvinceAdminStatus,
  getAllProvinceAdmins,
  getSystemStats,
  getAllInstitutions,
  getAllScholarships,
  getAllApplications,
  getDetailedReports,
  updateAdminPassword,
} from "../controllers/SuperAdminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require super_admin role
router.use(protect, requireRole("super_admin"));

router.post("/province-admins", createProvinceAdmin);
router.get("/province-admins", getAllProvinceAdmins);
router.patch("/province-admins/:id/status", toggleProvinceAdminStatus);
router.get("/stats", getSystemStats);
router.get("/institutions", getAllInstitutions);
router.get("/scholarships", getAllScholarships);
router.get("/applications", getAllApplications);
router.get("/reports/detailed", getDetailedReports);
router.patch("/settings/password", updateAdminPassword);

export default router;
