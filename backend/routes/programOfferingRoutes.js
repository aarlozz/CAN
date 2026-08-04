import express from "express";
import {
  listOfferings,
  createOrUpdateOffering,
  bulkUpsertOfferings,
  deleteOffering,
  getCoverageReport,
} from "../controllers/admin/programOfferingController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Mirrors the province_admin/super_admin pattern used for verifyInstitution
// in institutionRoutes.js. Adjust roles if catalog data should be
// super_admin-only in your system.
router.get(
  "/program-offerings",
  protect,
  requireRole("province_admin", "super_admin"),
  listOfferings,
);
router.get(
  "/program-offerings/coverage",
  protect,
  requireRole("province_admin", "super_admin"),
  getCoverageReport,
);
router.post(
  "/program-offerings",
  protect,
  requireRole("province_admin", "super_admin"),
  createOrUpdateOffering,
);
router.post(
  "/program-offerings/bulk",
  protect,
  requireRole("province_admin", "super_admin"),
  bulkUpsertOfferings,
);
router.delete(
  "/program-offerings/:id",
  protect,
  requireRole("province_admin", "super_admin"),
  deleteOffering,
);

export default router;