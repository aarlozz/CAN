import Province from "../models/Province.js";
import District from "../models/District.js";
import Municipality from "../models/Municipality.js";

// GET /api/location/provinces
export const getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find().sort({ provinceName: 1 });
    res.json({ provinces });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/location/districts?provinceId=<id>
export const getDistricts = async (req, res) => {
  try {
    const { provinceId } = req.query;
    const filter = provinceId ? { provinceId } : {};
    const districts = await District.find(filter).sort({ districtName: 1 });
    res.json({ districts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/location/municipalities?districtId=<id>
export const getMunicipalities = async (req, res) => {
  try {
    const { districtId } = req.query;
    const filter = districtId ? { districtId } : {};
    const municipalities = await Municipality.find(filter).sort({
      municipalityName: 1,
    });
    res.json({ municipalities });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
