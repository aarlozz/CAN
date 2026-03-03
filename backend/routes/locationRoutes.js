// locationRoutes.js — Public location data endpoints
// No auth required — used to populate signup/profile dropdowns.
//
//   GET /api/locations/provinces
//   GET /api/locations/districts/:provinceId
//   GET /api/locations/municipalities/:districtId
//   GET /api/locations/all

const express = require('express');
const {
  getProvinces,
  getDistricts,
  getMunicipalities,
  getAllLocations,
} = require('../controllers/locationController');

const router = express.Router();

router.get('/provinces',                  getProvinces);
router.get('/districts/:provinceId',      getDistricts);
router.get('/municipalities/:districtId', getMunicipalities);
router.get('/all',                        getAllLocations);

module.exports = router;