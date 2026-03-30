import express, { Router } from "express";

import { protect } from "../middleware/authMiddleware.js";
import { createScholarship } from "../controllers/ScholarshipBuilding.js";
import { getmyScholarship } from "../controllers/ScholarshipBuilding.js";

const router = express.Router();

router.post("/addscholarship", protect, createScholarship);
router.post("/myscholarships", protect, getmyScholarship)

export default router;
