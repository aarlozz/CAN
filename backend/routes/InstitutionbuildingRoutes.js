import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getApplicationData } from "../controllers/Institutionbuilding.js";
import { getInstitutionData } from "../controllers/Institutionbuilding.js";

const router = express.Router();

router.get("/dashboard-institution", protect, getInstitutionData);
router.get("/getapplicationdata", protect, getApplicationData);

export default router;
