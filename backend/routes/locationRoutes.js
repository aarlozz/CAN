import express from "express";
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
} from "../controllers/locationController.js";

const router = express.Router();

// Public — no auth needed, used by frontend dropdowns
router.get("/provinces", getProvinces);
router.get("/districts", getDistricts);         // ?provinceId=<id>
router.get("/municipalities", getMunicipalities); // ?districtId=<id>

export default router;