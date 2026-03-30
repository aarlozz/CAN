import { getAllInstitutions } from "../controllers/Institutionbuilding.js";
import express from "express";
<<<<<<< HEAD

const router = express.Router();

router.get("/all-institution", getAllInstitutions);
export default router
=======
import { protect } from "../middleware/authMiddleware.js";
import { getApplicationData } from "../controllers/Institutionbuilding.js";

const router = express.Router();

router.get("/all-institution", protect, getInstitutionData);
router.get("/getapplicationdata", protect, getApplicationData);

export default router;
>>>>>>> kiran
