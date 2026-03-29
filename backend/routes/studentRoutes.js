import express from "express";
import { getStudentDashboard } from "../controllers/StudentProfileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard-student", protect, getStudentDashboard);

export default router;