import { login } from "../controllers/authControllerbuilding.js";
import { signup } from "../controllers/authControllerbuilding.js";
import { applytToInstitution } from "../controllers/ApplicationController.js";

import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("application", protect, applytToInstitution)


export default router;
