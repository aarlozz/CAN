import express from "express";
import { getInstitutionDashboard } from "../controllers/InstitutionProfileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard-institution", protect, getInstitutionDashboard);
export default router;
