import express from "express";
import {
  createScholarship,
  getAllScholarships,
  getMyScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} from "../controllers/scholarshipController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

//  FIX: named routes MUST come before /:id 
// Old order: GET /:id was first — Express captured "my" and "all" as the :id
// param → Mongoose threw CastError trying ObjectId("my") or ObjectId("all").

// Public
router.get("/all", getAllScholarships);

// Institution only — named routes first
router.get("/my",    protect, requireRole("institution"), getMyScholarships);
router.post("/create", protect, requireRole("institution"), createScholarship);

// Param routes last
router.get("/:id",    getScholarshipById);
router.patch("/:id",  protect, requireRole("institution"), updateScholarship);
router.delete("/:id", protect, requireRole("institution"), deleteScholarship);

export default router;
