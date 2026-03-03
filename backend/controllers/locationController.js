// locationController.js — Public location data endpoints
// All routes are public (no auth required) — used for signup dropdowns.

const asyncHandler = require('../utils/asyncHandler');
const Province     = require('../models/Province');
const District     = require('../models/District');
const Municipality = require('../models/Municipality');

// ─────────────────────────────────────────────────────────────────
// GET /api/locations/provinces
// Returns all 7 provinces sorted by provinceCode
// ─────────────────────────────────────────────────────────────────
exports.getProvinces = asyncHandler(async (req, res) => {
  const provinces = await Province
    .find({})
    .select('provinceName provinceCode')
    .sort({ provinceCode: 1 })
    .lean();

  res.json({
    success: true,
    count:   provinces.length,
    data:    provinces,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/locations/districts/:provinceId
// Returns all districts for a given province, sorted alphabetically
// ─────────────────────────────────────────────────────────────────
exports.getDistricts = asyncHandler(async (req, res) => {
  const { provinceId } = req.params;

  const districts = await District
    .find({ provinceId })
    .select('districtName provinceName')
    .sort({ districtName: 1 })
    .lean();

  res.json({
    success: true,
    count:   districts.length,
    data:    districts,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/locations/municipalities/:districtId
// Returns all municipalities for a given district, sorted by type then name
// ─────────────────────────────────────────────────────────────────
exports.getMunicipalities = asyncHandler(async (req, res) => {
  const { districtId } = req.params;

  const municipalities = await Municipality
    .find({ districtId })
    .select('municipalityName municipalityType districtName')
    .sort({ municipalityType: 1, municipalityName: 1 })
    .lean();

  res.json({
    success: true,
    count:   municipalities.length,
    data:    municipalities,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/locations/all
// Returns full hierarchy in one call — for forms that want to
// pre-load all location data client-side (small dataset, cacheable)
// ─────────────────────────────────────────────────────────────────
exports.getAllLocations = asyncHandler(async (req, res) => {
  const [provinces, districts, municipalities] = await Promise.all([
    Province.find({}).select('provinceName provinceCode').sort({ provinceCode: 1 }).lean(),
    District.find({}).select('districtName provinceId provinceName').sort({ districtName: 1 }).lean(),
    Municipality.find({}).select('municipalityName municipalityType districtId districtName').sort({ municipalityName: 1 }).lean(),
  ]);

  res.json({
    success: true,
    data: {
      provinces,
      districts,
      municipalities,
    },
  });
});