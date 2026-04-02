import express from "express"
import { newInstitutionSignup } from "../controllers/authController.js"
import { institutionLogin } from "../controllers/authController.js"

const router = express.Router()

router.post("/signup-institution", newInstitutionSignup)
router.post("/login-institution", institutionLogin)

export default router
