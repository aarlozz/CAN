import express from "express";
import {
  createProvinceAdmin,
  toggleProvinceAdminStatus,
  getAllProvinceAdmins,
  getSystemStats,
} from "../controllers/SuperAdminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require super_admin role
router.use(protect, requireRole("super_admin"));

router.post("/province-admins", createProvinceAdmin);
router.get("/province-admins", getAllProvinceAdmins);
router.patch("/province-admins/:id/status", toggleProvinceAdminStatus);
router.get("/stats", getSystemStats);

export default router;
