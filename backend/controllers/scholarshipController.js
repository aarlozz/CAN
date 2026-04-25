import Scholarship from "../models/Scholarship.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import Province from "../models/Province.js";
import District from "../models/District.js";
import Municipality from "../models/Municipality.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves location IDs → names, and also accepts plain name strings
 * so the frontend can send either { provinceId } or { provinceName }.
 */
const resolveLocationFilter = async (locationFilter = {}) => {
  const result = {};

  // Province
  if (locationFilter.provinceId) {
    const prov = await Province.findById(locationFilter.provinceId);
    if (prov)
      result.province = {
        provinceId: prov._id,
        provinceName: prov.provinceName,
      };
  } else if (locationFilter.provinceName) {
    result.province = { provinceName: locationFilter.provinceName };
  }

  // District
  if (locationFilter.districtId) {
    const dist = await District.findById(locationFilter.districtId);
    if (dist)
      result.district = {
        districtId: dist._id,
        districtName: dist.districtName,
      };
  } else if (locationFilter.districtName) {
    result.district = { districtName: locationFilter.districtName };
  }

  // Municipality
  if (locationFilter.municipalityId) {
    const muni = await Municipality.findById(locationFilter.municipalityId);
    if (muni)
      result.municipality = {
        municipalityId: muni._id,
        municipalityName: muni.municipalityName,
      };
  } else if (locationFilter.municipalityName) {
    result.municipality = { municipalityName: locationFilter.municipalityName };
  }

  return result;
};

// ─── POST /api/scholarship/create ────────────────────────────────────────────
export const createScholarship = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });

    if (!institution) {
      return res
        .status(404)
        .json({ message: "Institution profile not found." });
    }

    if (institution.verification?.status !== "verified") {
      return res.status(403).json({
        message: "Only verified institutions can post scholarships.",
      });
    }

    const {
      // Core
      scholarshipTitle,
      description,
      termsAndConditions,
      applicationDeadline,
      // Coverage (nested)
      coverage,
      // Eligibility (nested)
      eligibilityCriteria,
      // Seats (top-level)
      totalSeats,
      remainingSeats,
      // Location
      locationFilter,
    } = req.body;

    // ── Required field validation ──────────────────────────────────────────────
    if (!scholarshipTitle || !applicationDeadline) {
      return res.status(400).json({
        message: "scholarshipTitle and applicationDeadline are required.",
      });
    }

    // coverage.scholarshipType2 is optional per schema (commented-out required),
    // but validate enum if provided
    const VALID_TYPES = [
      "full_tuition",
      "partial_tuition",
      "merit_based",
      "need_based",
      "disability",
      "gender",
      "ethnic",
    ];
    if (
      coverage?.scholarshipType2 &&
      !VALID_TYPES.includes(coverage.scholarshipType2)
    ) {
      return res.status(400).json({
        message: `Invalid scholarshipType2. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    // ── Seats validation ───────────────────────────────────────────────────────
    const parsedTotalSeats = totalSeats ? Number(totalSeats) : undefined;
    const parsedRemainingSeats = remainingSeats
      ? Number(remainingSeats)
      : parsedTotalSeats; // default to total

    if (
      parsedTotalSeats !== undefined &&
      parsedRemainingSeats !== undefined &&
      parsedRemainingSeats > parsedTotalSeats
    ) {
      return res.status(400).json({
        message: "remainingSeats cannot exceed totalSeats.",
      });
    }

    // ── Resolve location ───────────────────────────────────────────────────────
    const resolvedLocation = await resolveLocationFilter(locationFilter || {});

    // ── Build coverage object ──────────────────────────────────────────────────
    const coverageData = {};
    if (coverage?.scholarshipType2)
      coverageData.scholarshipType2 = coverage.scholarshipType2;
    if (coverage?.amountNpr != null)
      coverageData.amountNpr = Number(coverage.amountNpr);
    if (coverage?.percentage != null)
      coverageData.percentage = Number(coverage.percentage);

    // ── Build eligibility object ───────────────────────────────────────────────
    const VALID_LEVELS = [
      "plus_two",
      "bachelor",
      "master",
      "mphil",
      "phd",
      "diploma",
    ];
    const VALID_GENDERS = ["male", "female", "other", "any"];

    const eligibilityData = {
      gender: VALID_GENDERS.includes(eligibilityCriteria?.gender)
        ? eligibilityCriteria.gender
        : "any",
      isNepali: eligibilityCriteria?.isNepali ?? true,
      hasDisability: eligibilityCriteria?.hasDisability ?? false,
    };
    if (
      eligibilityCriteria?.targetLevel &&
      VALID_LEVELS.includes(eligibilityCriteria.targetLevel)
    ) {
      eligibilityData.targetLevel = eligibilityCriteria.targetLevel;
    }
    if (eligibilityCriteria?.targetFaculty)
      eligibilityData.targetFaculty = eligibilityCriteria.targetFaculty;
    if (eligibilityCriteria?.subject)
      eligibilityData.subject = eligibilityCriteria.subject;
    if (eligibilityCriteria?.additionalRequirements)
      eligibilityData.additionalRequirements =
        eligibilityCriteria.additionalRequirements;
    if (
      Array.isArray(eligibilityCriteria?.requiredDocuments) &&
      eligibilityCriteria.requiredDocuments.length > 0
    ) {
      eligibilityData.requiredDocuments = eligibilityCriteria.requiredDocuments;
    }

    // ── Create ─────────────────────────────────────────────────────────────────
    const scholarship = await Scholarship.create({
      institutionId: institution._id,
      institutionName: institution.institutionName,
      scholarshipTitle,
      ...(description && { description }),
      ...(termsAndConditions && { termsAndConditions }),
      applicationDeadline,
      coverage: coverageData,
      eligibilityCriteria: eligibilityData,
      ...(parsedTotalSeats !== undefined && { totalSeats: parsedTotalSeats }),
      ...(parsedRemainingSeats !== undefined && {
        remainingSeats: parsedRemainingSeats,
      }),
      locationFilter: resolvedLocation,
      isActive: true,
      isDeleted: false,
    });

    res.status(201).json({ message: "Scholarship created.", scholarship });
  } catch (error) {
    console.error("createScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/scholarship/all  (public) ──────────────────────────────────────
export const getAllScholarships = async (req, res) => {
  try {
    const {
      provinceId,
      scholarshipType2, // was scholarshipType — now coverage.scholarshipType2
      targetLevel,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isDeleted: { $ne: true },
      isActive: { $ne: false },
    };

    if (provinceId) filter["locationFilter.province.provinceId"] = provinceId;
    if (scholarshipType2)
      filter["coverage.scholarshipType2"] = scholarshipType2;
    if (targetLevel) filter["eligibilityCriteria.targetLevel"] = targetLevel;

    if (search?.trim()) {
      filter.$or = [
        { scholarshipTitle: { $regex: search.trim(), $options: "i" } },
        { institutionName: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
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
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      scholarships,
    });
  } catch (error) {
    console.error("getAllScholarships error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/scholarship/my  (institution only) ──────────────────────────────
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

// ─── GET /api/scholarship/:id  (public) ───────────────────────────────────────
export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    })
      .populate(
        "institutionId",
        "institutionName location contactPerson website",
      )
      .lean();

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found." });
    }

    res.json({ scholarship });
  } catch (error) {
    console.error("getScholarshipById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PATCH /api/scholarship/:id  (institution only) ───────────────────────────
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

    // Only allow updating schema-valid top-level fields
    const ALLOWED = [
      "scholarshipTitle",
      "description",
      "termsAndConditions",
      "applicationDeadline",
      "coverage",
      "eligibilityCriteria",
      "totalSeats",
      "remainingSeats",
      "locationFilter",
      "isActive",
    ];

    ALLOWED.forEach((field) => {
      if (req.body[field] !== undefined) scholarship[field] = req.body[field];
    });

    // Re-validate seats if either was updated
    if (
      scholarship.remainingSeats !== undefined &&
      scholarship.totalSeats !== undefined &&
      scholarship.remainingSeats > scholarship.totalSeats
    ) {
      return res
        .status(400)
        .json({ message: "remainingSeats cannot exceed totalSeats." });
    }

    await scholarship.save();
    res.json({ message: "Scholarship updated.", scholarship });
  } catch (error) {
    console.error("updateScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── DELETE /api/scholarship/:id  (institution only — soft delete) ────────────
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
    scholarship.isActive = false;
    await scholarship.save();

    res.json({ message: "Scholarship deleted." });
  } catch (error) {
    console.error("deleteScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
