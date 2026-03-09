import { login } from "../controllers/authControllerbuilding.js";
import { signup } from "../controllers/authControllerbuilding.js";

import express from "express";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
