import { login, signup, googleLogin } from "../controllers/authControllerbuilding.js";

import express from "express";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-login", googleLogin);

export default router;
