import { getAllInstitutions } from "../controllers/Institutionbuilding.js";
import express from "express";

const router = express.Router();

router.get("/all-institution", getAllInstitutions);
export default router
