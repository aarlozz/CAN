import { getInstitutionData } from "../controllers/Institutionbuilding.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all-institution", getInstitutionData);
export default router
