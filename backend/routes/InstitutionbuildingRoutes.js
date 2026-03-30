import express from "express";
import { getAllInstitutions, getApplicationData } from "../controllers/Institutionbuilding.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/all-institution", getAllInstitutions);

// Protected routes
router.get("/all-institution-protected", protect, getAllInstitutions); // optional: same route but protected
router.get("/getapplicationdata", protect, getApplicationData);

export default router;