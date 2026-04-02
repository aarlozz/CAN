import express, { Router } from "express";

import { protect } from "../middleware/authMiddleware.js";
import { createScholarship } from "../controllers/ScholarshipBuilding.js";
import { getmyScholarship } from "../controllers/ScholarshipBuilding.js";
import { isInstitution } from "../middleware/authMiddleware.js";
import { getAllScholarships } from "../controllers/ScholarshipBuilding.js";

const router = express.Router();

router.post("/addscholarship", protect, isInstitution, createScholarship);
router.post("/myscholarships", protect, isInstitution, getmyScholarship);
router.post("/getallscholarship", getAllScholarships);

export default router;
