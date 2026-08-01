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
  "short_term_training",
  "primary",
  "lower_secondary",
  "secondary",
  "see",
  "plus_two",
  "diploma_pcl",
  "pre_diploma",
  "bachelor",
  "ca",
  "postgraduate_diploma",
  "master",
  "mphil",
  "phd",
];
const VALID_GENDERS = ["male", "female", "other", "any"];
const VALID_COLLEGE_TYPES = [
  "public",
  "private",
  "community",
  "constituent_campus",
  "affiliated_college",
];
const VALID_ETHNIC_CATEGORIES = [
  "dalit",
  "janajati",
  "madhesi",
  "muslim",
  "backward_region",
  "general",
  "any",
];

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
 *
 * Handles the fee/amount/percentage triangle: an institution may not always
 * know or provide all three of {totalProgramFeeNpr, amountNpr, percentage}.
 * Whichever two are given, the third is derived automatically:
 *   - fee + percentage        → amount = fee * (percentage / 100)
 *   - fee + amount            → percentage = (amount / fee) * 100
 *   - percentage + amount     → fee = amount / (percentage / 100)
 *   - all three given         → trusted as-is, institution's numbers win
 *   - only one (or none) given → nothing to derive, left as-is
 *
 * Shared by both createScholarship and updateScholarship.
 */
const buildCoverage = (coverage = {}) => {
  const data = {};
  if (
    coverage.scholarshipType2 &&
    VALID_TYPES.includes(coverage.scholarshipType2)
  )
    data.scholarshipType2 = coverage.scholarshipType2;

  let fee =
    coverage.totalProgramFeeNpr != null
      ? Number(coverage.totalProgramFeeNpr)
      : undefined;
  let amount = coverage.amountNpr != null ? Number(coverage.amountNpr) : undefined;
  let percentage =
    coverage.percentage != null ? Number(coverage.percentage) : undefined;

  const hasFee = fee != null && !Number.isNaN(fee) && fee > 0;
  const hasAmount = amount != null && !Number.isNaN(amount);
  const hasPercentage = percentage != null && !Number.isNaN(percentage);

  if (hasFee && hasPercentage && !hasAmount) {
    amount = Math.round(fee * (percentage / 100));
  } else if (hasFee && hasAmount && !hasPercentage) {
    percentage = Math.min(100, Math.round((amount / fee) * 10000) / 100);
  } else if (hasPercentage && hasAmount && !hasFee && percentage > 0) {
    fee = Math.round(amount / (percentage / 100));
  }
  // If all three are present, or only one is present, leave as given —
  // nothing to (re)compute either way.

  if (fee != null && !Number.isNaN(fee)) data.totalProgramFeeNpr = fee;
  if (amount != null && !Number.isNaN(amount)) data.amountNpr = amount;
  if (percentage != null && !Number.isNaN(percentage))
    data.percentage = percentage;

  return data;
};

/**
 * Validates the extra eligibility fields that have cross-field or numeric
 * range constraints beyond what Mongoose enum/min/max already enforce.
 * Returns an array of human-readable error strings (empty = valid).
 */
const validateEligibilityExtras = (e = {}) => {
  const errors = [];

  if (e.minGPA != null && e.minPercentage != null)
    errors.push(
      "Set either minGPA or minPercentage, not both — they measure the same thing on different scales.",
    );

  if (e.minGPA != null && (e.minGPA < 0 || e.minGPA > 5))
    errors.push("minGPA should be between 0 and 5.");

  if (e.minPercentage != null && (e.minPercentage < 0 || e.minPercentage > 100))
    errors.push("minPercentage should be between 0 and 100.");

  if (
    e.ethnicCategory &&
    !VALID_ETHNIC_CATEGORIES.includes(e.ethnicCategory)
  )
    errors.push(
      `Invalid ethnicCategory. Must be one of: ${VALID_ETHNIC_CATEGORIES.join(", ")}`,
    );

  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge)
    errors.push("minAge cannot be greater than maxAge.");

  if (e.minEntranceScore != null && !e.entranceExamName)
    errors.push(
      "entranceExamName is required when minEntranceScore is set (so applicants know which exam it refers to).",
    );

  if (
    e.minAttendancePercent != null &&
    (e.minAttendancePercent < 0 || e.minAttendancePercent > 100)
  )
    errors.push("minAttendancePercent should be between 0 and 100.");

  return errors;
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
  if (eligibilityCriteria.degreeProgram)
    data.degreeProgram = eligibilityCriteria.degreeProgram;
  if (eligibilityCriteria.university)
    data.university = eligibilityCriteria.university;
  if (
    eligibilityCriteria.collegeType &&
    VALID_COLLEGE_TYPES.includes(eligibilityCriteria.collegeType)
  )
    data.collegeType = eligibilityCriteria.collegeType;
  if (eligibilityCriteria.subject) data.subject = eligibilityCriteria.subject;

  // ── Academic performance ───────────────────────────────────────────────────
  if (eligibilityCriteria.minGPA != null)
    data.minGPA = Number(eligibilityCriteria.minGPA);
  if (eligibilityCriteria.minPercentage != null)
    data.minPercentage = Number(eligibilityCriteria.minPercentage);

  // ── Category / quota ────────────────────────────────────────────────────────
  if (
    eligibilityCriteria.ethnicCategory &&
    VALID_ETHNIC_CATEGORIES.includes(eligibilityCriteria.ethnicCategory)
  )
    data.ethnicCategory = eligibilityCriteria.ethnicCategory;

  // ── Age limit ───────────────────────────────────────────────────────────────
  if (eligibilityCriteria.minAge != null)
    data.minAge = Number(eligibilityCriteria.minAge);
  if (eligibilityCriteria.maxAge != null)
    data.maxAge = Number(eligibilityCriteria.maxAge);

  // ── Entrance exam ───────────────────────────────────────────────────────────
  if (eligibilityCriteria.entranceExamName)
    data.entranceExamName = eligibilityCriteria.entranceExamName;
  if (eligibilityCriteria.minEntranceScore != null)
    data.minEntranceScore = Number(eligibilityCriteria.minEntranceScore);

  // ── Other flags ─────────────────────────────────────────────────────────────
  if (eligibilityCriteria.isFirstGenerationLearner != null)
    data.isFirstGenerationLearner = Boolean(
      eligibilityCriteria.isFirstGenerationLearner,
    );
  if (eligibilityCriteria.minAttendancePercent != null)
    data.minAttendancePercent = Number(
      eligibilityCriteria.minAttendancePercent,
    );

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

    const eligibilityErrors = validateEligibilityExtras(eligibilityCriteria);
    if (eligibilityErrors.length > 0)
      return res.status(400).json({ message: eligibilityErrors.join(" ") });

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
      // Location cascade
      provinceId,
      districtId,
      municipalityId,
      // Coverage
      scholarshipType,
      scholarshipType2, // accepted as an alias for backwards compatibility
      minAmount,
      maxAmount,
      // Eligibility — academic / demographic
      targetLevel,
      targetFaculty,
      degreeProgram,
      university,
      collegeType,
      subject,
      gender,
      hasDisability,
      // Eligibility — new fields
      ethnicCategory,
      minGPA, // student's own GPA; matches scholarships whose requirement is <= this
      minPercentage, // same idea, percentage scale
      studentAge, // matches scholarships whose [minAge, maxAge] window contains this
      isFirstGenerationLearner,
      // Status / lifecycle
      status = "active",
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isDeleted: { $ne: true },
      "verification.status": "approved", // Only show approved scholarships to students
    };

    // ── Status (active / expired / all) ─────────────────────────────────────
    const now = new Date();
    if (status === "active") {
      filter.isActive = { $ne: false };
      filter.applicationDeadline = { $gte: now };
    } else if (status === "expired") {
      filter.applicationDeadline = { $lt: now };
    } // status === "all" → no extra constraint

    // ── Location cascade ─────────────────────────────────────────────────────
    if (municipalityId)
      filter["locationFilter.municipality.municipalityId"] = municipalityId;
    else if (districtId)
      filter["locationFilter.district.districtId"] = districtId;
    else if (provinceId)
      filter["locationFilter.province.provinceId"] = provinceId;

    // ── Coverage ──────────────────────────────────────────────────────────────
    const type = scholarshipType || scholarshipType2;
    if (type) filter["coverage.scholarshipType2"] = type;

    if (minAmount || maxAmount) {
      filter["coverage.amountNpr"] = {};
      if (minAmount) filter["coverage.amountNpr"].$gte = Number(minAmount);
      if (maxAmount) filter["coverage.amountNpr"].$lte = Number(maxAmount);
    }

    // ── Eligibility ───────────────────────────────────────────────────────────
    if (targetLevel) filter["eligibilityCriteria.targetLevel"] = targetLevel;
    if (targetFaculty)
      filter["eligibilityCriteria.targetFaculty"] = {
        $regex: targetFaculty,
        $options: "i",
      };
    if (degreeProgram)
      filter["eligibilityCriteria.degreeProgram"] = {
        $regex: degreeProgram,
        $options: "i",
      };
    if (university)
      filter["eligibilityCriteria.university"] = {
        $regex: university,
        $options: "i",
      };
    if (collegeType) filter["eligibilityCriteria.collegeType"] = collegeType;
    if (subject)
      filter["eligibilityCriteria.subject"] = {
        $regex: subject,
        $options: "i",
      };
    if (gender && gender !== "any")
      filter["eligibilityCriteria.gender"] = { $in: [gender, "any"] };
    if (hasDisability === "true")
      filter["eligibilityCriteria.hasDisability"] = true;

    // Category: student picks their own category, we match scholarships
    // targeting that category OR open to everyone ("any"/unset).
    if (ethnicCategory && ethnicCategory !== "any")
      filter["eligibilityCriteria.ethnicCategory"] = {
        $in: [ethnicCategory, "any", null],
      };

    // GPA/percentage: student enters their own score; only show scholarships
    // whose minimum requirement they clear (or scholarships with no requirement).
    if (minGPA != null && minGPA !== "")
      filter.$and = (filter.$and || []).concat([
        {
          $or: [
            { "eligibilityCriteria.minGPA": { $exists: false } },
            { "eligibilityCriteria.minGPA": { $lte: Number(minGPA) } },
          ],
        },
      ]);
    if (minPercentage != null && minPercentage !== "")
      filter.$and = (filter.$and || []).concat([
        {
          $or: [
            { "eligibilityCriteria.minPercentage": { $exists: false } },
            {
              "eligibilityCriteria.minPercentage": {
                $lte: Number(minPercentage),
              },
            },
          ],
        },
      ]);

    // Age: student enters their age; only show scholarships whose [min,max]
    // window contains it (unset bounds are treated as open).
    if (studentAge != null && studentAge !== "") {
      const age = Number(studentAge);
      filter.$and = (filter.$and || []).concat([
        {
          $or: [
            { "eligibilityCriteria.minAge": { $exists: false } },
            { "eligibilityCriteria.minAge": { $lte: age } },
          ],
        },
        {
          $or: [
            { "eligibilityCriteria.maxAge": { $exists: false } },
            { "eligibilityCriteria.maxAge": { $gte: age } },
          ],
        },
      ]);
    }

    if (isFirstGenerationLearner === "true")
      filter["eligibilityCriteria.isFirstGenerationLearner"] = true;

    if (search?.trim()) {
      filter.$or = (filter.$or || []).concat([
        { scholarshipTitle: { $regex: search.trim(), $options: "i" } },
        { institutionName: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ]);
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

    if (eligibilityCriteria !== undefined) {
      const eligibilityErrors = validateEligibilityExtras(eligibilityCriteria);
      if (eligibilityErrors.length > 0)
        return res.status(400).json({ message: eligibilityErrors.join(" ") });
    }

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