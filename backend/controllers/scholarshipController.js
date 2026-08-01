import Scholarship from "../models/Scholarship.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import Province from "../models/Province.js";
import District from "../models/District.js";
import Municipality from "../models/Municipality.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_TYPES = [
  "full_tuition",
  "partial_tuition",
  "merit_based",
  "need_based",
  "disability",
  "gender",
  "ethnic",
];
const VALID_LEVELS = [
  "plus_two",
  "bachelor",
  "master",
  "mphil",
  "phd",
  "diploma",
];
const VALID_GENDERS = ["male", "female", "other", "any"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves location IDs → names, and also accepts plain name strings
 * so the frontend can send either { provinceId } or { provinceName }.
 * Also handles the nested shape the frontend sends:
 *   locationFilter.province.provinceName  (from scholarshipToForm → buildPayload)
 */
const resolveLocationFilter = async (locationFilter = {}) => {
  const result = {};

  // Province
  const provinceId =
    locationFilter.province?.provinceId || locationFilter.provinceId;
  const provinceName =
    locationFilter.province?.provinceName || locationFilter.provinceName;
  if (provinceId) {
    const prov = await Province.findById(provinceId);
    if (prov)
      result.province = {
        provinceId: prov._id,
        provinceName: prov.provinceName,
      };
  } else if (provinceName) {
    result.province = { provinceName };
  }

  // District
  const districtId =
    locationFilter.district?.districtId || locationFilter.districtId;
  const districtName =
    locationFilter.district?.districtName || locationFilter.districtName;
  if (districtId) {
    const dist = await District.findById(districtId);
    if (dist)
      result.district = {
        districtId: dist._id,
        districtName: dist.districtName,
      };
  } else if (districtName) {
    result.district = { districtName };
  }

  // Municipality
  const municipalityId =
    locationFilter.municipality?.municipalityId ||
    locationFilter.municipalityId;
  const municipalityName =
    locationFilter.municipality?.municipalityName ||
    locationFilter.municipalityName;
  if (municipalityId) {
    const muni = await Municipality.findById(municipalityId);
    if (muni)
      result.municipality = {
        municipalityId: muni._id,
        municipalityName: muni.municipalityName,
      };
  } else if (municipalityName) {
    result.municipality = { municipalityName };
  }

  return result;
};

/**
 * Builds a validated coverage object from raw body data.
 * Shared by both createScholarship and updateScholarship.
 */
const buildCoverage = (coverage = {}) => {
  const data = {};
  if (
    coverage.scholarshipType2 &&
    VALID_TYPES.includes(coverage.scholarshipType2)
  )
    data.scholarshipType2 = coverage.scholarshipType2;
  if (coverage.amountNpr != null) data.amountNpr = Number(coverage.amountNpr);
  if (coverage.percentage != null)
    data.percentage = Number(coverage.percentage);
  return data;
};

/**
 * Builds a validated eligibilityCriteria object from raw body data.
 * Shared by both createScholarship and updateScholarship.
 */
const buildEligibility = (eligibilityCriteria = {}) => {
  const data = {
    gender: VALID_GENDERS.includes(eligibilityCriteria.gender)
      ? eligibilityCriteria.gender
      : "any",
    isNepali: eligibilityCriteria.isNepali ?? true,
    hasDisability: eligibilityCriteria.hasDisability ?? false,
  };
  if (
    eligibilityCriteria.targetLevel &&
    VALID_LEVELS.includes(eligibilityCriteria.targetLevel)
  )
    data.targetLevel = eligibilityCriteria.targetLevel;
  if (eligibilityCriteria.targetFaculty)
    data.targetFaculty = eligibilityCriteria.targetFaculty;
  if (eligibilityCriteria.subject) data.subject = eligibilityCriteria.subject;
  if (eligibilityCriteria.additionalRequirements)
    data.additionalRequirements = eligibilityCriteria.additionalRequirements;
  if (
    Array.isArray(eligibilityCriteria.requiredDocuments) &&
    eligibilityCriteria.requiredDocuments.length > 0
  )
    data.requiredDocuments = eligibilityCriteria.requiredDocuments;
  return data;
};

// ─── POST /api/scholarship/create ────────────────────────────────────────────
export const createScholarship = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });
    if (!institution)
      return res
        .status(404)
        .json({ message: "Institution profile not found." });

    if (institution.verification?.status !== "verified")
      return res
        .status(403)
        .json({ message: "Only verified institutions can post scholarships." });

    const {
      scholarshipTitle,
      description,
      termsAndConditions,
      applicationDeadline,
      coverage,
      eligibilityCriteria,
      totalSeats,
      remainingSeats,
      locationFilter,
    } = req.body;

    if (!scholarshipTitle || !applicationDeadline)
      return res.status(400).json({
        message: "scholarshipTitle and applicationDeadline are required.",
      });

    if (
      coverage?.scholarshipType2 &&
      !VALID_TYPES.includes(coverage.scholarshipType2)
    )
      return res.status(400).json({
        message: `Invalid scholarshipType2. Must be one of: ${VALID_TYPES.join(", ")}`,
      });

    const parsedTotalSeats = totalSeats ? Number(totalSeats) : undefined;
    const parsedRemainingSeats = remainingSeats
      ? Number(remainingSeats)
      : parsedTotalSeats;

    if (
      parsedTotalSeats !== undefined &&
      parsedRemainingSeats !== undefined &&
      parsedRemainingSeats > parsedTotalSeats
    ) {
      return res
        .status(400)
        .json({ message: "remainingSeats cannot exceed totalSeats." });
    }

    const resolvedLocation = await resolveLocationFilter(locationFilter || {});

    const scholarship = await Scholarship.create({
      institutionId: institution._id,
      institutionName: institution.institutionName,
      scholarshipTitle,
      ...(description && { description }),
      ...(termsAndConditions && { termsAndConditions }),
      applicationDeadline,
      coverage: buildCoverage(coverage),
      eligibilityCriteria: buildEligibility(eligibilityCriteria),
      ...(parsedTotalSeats !== undefined && { totalSeats: parsedTotalSeats }),
      ...(parsedRemainingSeats !== undefined && {
        remainingSeats: parsedRemainingSeats,
      }),
      locationFilter: resolvedLocation,
      isActive: true,
      isDeleted: false,
      verification: { status: "pending" }, // explicitly require approval
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
      scholarshipType2,
      targetLevel,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      "verification.status": "approved", // Only show approved scholarships to students
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
    if (!institution)
      return res.status(404).json({ message: "Institution not found." });

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
      "verification.status": "approved",
    })
      .populate(
        "institutionId",
        "institutionName location contactPerson website",
      )
      .lean();

    if (!scholarship)
      return res.status(404).json({ message: "Scholarship not found." });

    res.json({ scholarship });
  } catch (error) {
    console.error("getScholarshipById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/scholarship/:id  (institution only) ────────────────────────────
export const updateScholarship = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({ user: req.user.id });
    if (!institution)
      return res.status(404).json({ message: "Institution not found." });

    const scholarship = await Scholarship.findOne({
      _id: req.params.id,
      institutionId: institution._id,
      isDeleted: { $ne: true },
    });

    if (!scholarship)
      return res.status(404).json({ message: "Scholarship not found." });

    const {
      scholarshipTitle,
      description,
      termsAndConditions,
      applicationDeadline,
      coverage,
      eligibilityCriteria,
      totalSeats,
      remainingSeats,
      locationFilter,
      isActive,
    } = req.body;

    // ── Basic validation ───────────────────────────────────────────────────────
    if (scholarshipTitle !== undefined && !scholarshipTitle)
      return res
        .status(400)
        .json({ message: "scholarshipTitle cannot be empty." });

    if (applicationDeadline !== undefined && !applicationDeadline)
      return res
        .status(400)
        .json({ message: "applicationDeadline cannot be empty." });

    if (
      coverage?.scholarshipType2 &&
      !VALID_TYPES.includes(coverage.scholarshipType2)
    )
      return res.status(400).json({
        message: `Invalid scholarshipType2. Must be one of: ${VALID_TYPES.join(", ")}`,
      });

    // ── Seats validation (compare incoming vs existing as fallback) ────────────
    const parsedTotalSeats =
      totalSeats != null ? Number(totalSeats) : scholarship.totalSeats;
    const parsedRemainingSeats =
      remainingSeats != null
        ? Number(remainingSeats)
        : scholarship.remainingSeats;

    if (
      parsedTotalSeats !== undefined &&
      parsedRemainingSeats !== undefined &&
      parsedRemainingSeats > parsedTotalSeats
    ) {
      return res
        .status(400)
        .json({ message: "remainingSeats cannot exceed totalSeats." });
    }

    // ── Scalar fields ──────────────────────────────────────────────────────────
    if (scholarshipTitle !== undefined)
      scholarship.scholarshipTitle = scholarshipTitle;
    if (description !== undefined) scholarship.description = description;
    if (termsAndConditions !== undefined)
      scholarship.termsAndConditions = termsAndConditions;
    if (applicationDeadline !== undefined)
      scholarship.applicationDeadline = applicationDeadline;
    if (isActive !== undefined) scholarship.isActive = isActive;
    if (totalSeats != null) scholarship.totalSeats = parsedTotalSeats;
    if (remainingSeats != null)
      scholarship.remainingSeats = parsedRemainingSeats;

    // ── Nested objects — use the same builders as createScholarship ────────────
    if (coverage !== undefined) scholarship.coverage = buildCoverage(coverage);
    if (eligibilityCriteria !== undefined)
      scholarship.eligibilityCriteria = buildEligibility(eligibilityCriteria);
    if (locationFilter !== undefined)
      scholarship.locationFilter = await resolveLocationFilter(locationFilter);
    if (scholarship.verification?.status !== "pending") {
      scholarship.verification = {
        status: "pending",
        verifiedBy: null,
        verifiedAt: null,
        remarks: "",
      };
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
    if (!institution)
      return res.status(404).json({ message: "Institution not found." });

    const scholarship = await Scholarship.findOne({
      _id: req.params.id,
      institutionId: institution._id,
      isDeleted: { $ne: true },
    });

    if (!scholarship)
      return res.status(404).json({ message: "Scholarship not found." });

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
