import Scholarship from "../models/Scholarship.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import Province from "../models/Province.js";
import District from "../models/District.js";
import Municipality from "../models/Municipality.js";

const resolveLocationFilter = async (locationFilter = {}) => {
  const result = {};
  if (locationFilter.provinceId) {
    const prov = await Province.findById(locationFilter.provinceId);
    if (prov) result.province = { provinceId: prov._id, provinceName: prov.provinceName };
  }
  if (locationFilter.districtId) {
    const dist = await District.findById(locationFilter.districtId);
    if (dist) result.district = { districtId: dist._id, districtName: dist.districtName };
  }
  if (locationFilter.municipalityId) {
    const muni = await Municipality.findById(locationFilter.municipalityId);
    if (muni) result.municipality = { municipalityId: muni._id, municipalityName: muni.municipalityName };
  }
  return result;
};

// POST /api/scholarship/create
export const createScholarship = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });

    if (!institution) {
      return res.status(404).json({ message: "Institution profile not found." });
    }

    if (institution.verification?.status !== "verified") {
      return res.status(403).json({
        message: "Only verified institutions can post scholarships.",
      });
    }

    const {
      scholarshipTitle, description, scholarshipType,
      financialDetails, requirements, applicationDeadline, locationFilter,
    } = req.body;

    if (!scholarshipTitle || !scholarshipType || !applicationDeadline) {
      return res.status(400).json({
        message: "scholarshipTitle, scholarshipType and applicationDeadline are required.",
      });
    }

    const resolvedLocation = await resolveLocationFilter(locationFilter || {});

    const scholarship = await Scholarship.create({
      institutionId:   institution._id,
      institutionName: institution.institutionName,
      scholarshipTitle,
      description,
      scholarshipType,
      financialDetails: {
        amount:         Number(financialDetails?.amount)     || 0,
        totalSlots:     Number(financialDetails?.totalSlots) || 0,
        availableSlots: Number(financialDetails?.totalSlots) || 0,
      },
      requirements: {
        eligibilityCriteria:    requirements?.eligibilityCriteria    || "",
        requiredDocuments:      requirements?.requiredDocuments      || [],
        additionalRequirements: requirements?.additionalRequirements || "",
      },
      applicationDeadline,
      locationFilter: resolvedLocation,
      isActive:  true,
      isDeleted: false,
    });

    res.status(201).json({ message: "Scholarship created.", scholarship });
  } catch (error) {
    console.error("createScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/scholarship/all  (public — no auth required)
export const getAllScholarships = async (req, res) => {
  try {
    const { provinceId, scholarshipType, search, page = 1, limit = 10 } = req.query;

    const filter = {
      isDeleted: { $ne: true },
      isActive:  { $ne: false },
    };

    if (provinceId)      filter["locationFilter.province.provinceId"] = provinceId;
    if (scholarshipType) filter.scholarshipType = scholarshipType;

    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      filter.$or = [
        { scholarshipTitle: { $regex: searchTerm, $options: "i" } },
        { institutionName:  { $regex: searchTerm, $options: "i" } },
        { description:      { $regex: searchTerm, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [scholarships, total] = await Promise.all([
      Scholarship.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Scholarship.countDocuments(filter),
    ]);

    res.json({
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      scholarships,
    });
  } catch (error) {
    console.error("getAllScholarships error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/scholarship/my  (institution only)
export const getMyScholarships = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const scholarships = await Scholarship.find({
      institutionId: institution._id,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ count: scholarships.length, scholarships });
  } catch (error) {
    console.error("getMyScholarships error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/scholarship/:id  (public)
export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    })
      .populate("institutionId", "institutionName location contactPerson website")
      .lean(); // ← THE FIX: bypasses virtuals on populated institution document

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found." });
    }

    res.json({ scholarship });
  } catch (error) {
    console.error("getScholarshipById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/scholarship/:id  (institution only)
export const updateScholarship = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const scholarship = await Scholarship.findOne({
      _id: req.params.id,
      institutionId: institution._id,
      isDeleted: { $ne: true },
    });

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found." });
    }

    const allowed = [
      "scholarshipTitle", "description", "financialDetails",
      "requirements", "applicationDeadline", "locationFilter", "isActive",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) scholarship[field] = req.body[field];
    });

    await scholarship.save();
    res.json({ message: "Scholarship updated.", scholarship });
  } catch (error) {
    console.error("updateScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/scholarship/:id  (institution only — soft delete)
export const deleteScholarship = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const scholarship = await Scholarship.findOne({
      _id: req.params.id,
      institutionId: institution._id,
      isDeleted: { $ne: true },
    });

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found." });
    }

    scholarship.isDeleted = true;
    scholarship.deletedAt = new Date();
    scholarship.isActive  = false;
    await scholarship.save();

    res.json({ message: "Scholarship deleted." });
  } catch (error) {
    console.error("deleteScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
