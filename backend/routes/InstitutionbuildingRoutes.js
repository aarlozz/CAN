import express from "express";
import { getAllInstitutions, getApplicationData, getInstitutionData } from "../controllers/Institutionbuilding.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/all-institution", getAllInstitutions);

// Protected routes
router.get("/dashboard-institution", protect, getInstitutionData); // optional: same route but protected
router.get("/getapplicationdata", protect, getApplicationData);

export default router;