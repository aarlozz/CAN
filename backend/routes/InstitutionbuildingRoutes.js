import { getInstitutionData, getInstitutionById } from "../controllers/Institutionbuilding.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Named routes MUST come before /:id — otherwise Express/Mongoose will try
// to treat "all-institution" as an :id and throw a CastError.
router.get("/all-institution", getInstitutionData);
router.get("/:id", getInstitutionById);

export default router;