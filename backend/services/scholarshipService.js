import Scholarship from "../models/Scholarship.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import Province from "../models/Province.js";
import District from "../models/District.js";
import Municipality from "../models/Municipality.js";
import { AppError } from "../utils/AppError.js";

// ─── Constants ────────────────────────────────────────────────────────────────

export const VALID_TYPES = [
  "full_tuition",
  "partial_tuition",
  "merit_based",
  "need_based",
  "disability",
  "gender",
  "ethnic",
];

export const VALID_LEVELS = [
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

export const VALID_GENDERS = ["male", "female", "other", "any"];

export const VALID_COLLEGE_TYPES = [
  "public",
  "private",
  "community",
  "constituent_campus",
  "affiliated_college",
];

export const VALID_ETHNIC_CATEGORIES = [
  "dalit",
  "janajati",
  "madhesi",
  "muslim",
  "backward_region",
  "general",
  "any",
];

export const SEARCHABLE_FIELDS = [
  "scholarshipTitle",
  "institutionName",
  "description",
  "eligibilityCriteria.targetLevel",
  "eligibilityCriteria.targetFaculty",
  "eligibilityCriteria.degreeProgram",
  "eligibilityCriteria.university",
  "eligibilityCriteria.subject",
];

// ─── Pure Business Logic & Builders ───────────────────────────────────────────

export const buildSearchClauses = (search) => {
  const terms = search
    .trim()
    .split(/[,\s]+/)
    .map((t) => t.replace(/s$/i, ""))
    .filter(Boolean);

  return terms.map((term) => ({
    $or: SEARCHABLE_FIELDS.map((field) => ({
      [field]: { $regex: term, $options: "i" },
    })),
  }));
};

export const resolveLocationFilter = async (locationFilter = {}) => {
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

export const buildCoverage = (coverage = {}) => {
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

  if (fee != null && !Number.isNaN(fee)) data.totalProgramFeeNpr = fee;
  if (amount != null && !Number.isNaN(amount)) data.amountNpr = amount;
  if (percentage != null && !Number.isNaN(percentage))
    data.percentage = percentage;

  return data;
};

export const validateEligibilityExtras = (e = {}) => {
  const errors = [];

  if (e.minGPA != null && e.minPercentage != null)
    errors.push(
      "Set either minGPA or minPercentage, not both — they measure the same thing on different scales."
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
      `Invalid ethnicCategory. Must be one of: ${VALID_ETHNIC_CATEGORIES.join(", ")}`
    );

  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge)
    errors.push("minAge cannot be greater than maxAge.");

  if (e.minEntranceScore != null && !e.entranceExamName)
    errors.push(
      "entranceExamName is required when minEntranceScore is set (so applicants know which exam it refers to)."
    );

  if (
    e.minAttendancePercent != null &&
    (e.minAttendancePercent < 0 || e.minAttendancePercent > 100)
  )
    errors.push("minAttendancePercent should be between 0 and 100.");

  return errors;
};

export const buildEligibility = (eligibilityCriteria = {}) => {
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

  if (eligibilityCriteria.minGPA != null)
    data.minGPA = Number(eligibilityCriteria.minGPA);
  if (eligibilityCriteria.minPercentage != null)
    data.minPercentage = Number(eligibilityCriteria.minPercentage);

  if (
    eligibilityCriteria.ethnicCategory &&
    VALID_ETHNIC_CATEGORIES.includes(eligibilityCriteria.ethnicCategory)
  )
    data.ethnicCategory = eligibilityCriteria.ethnicCategory;

  if (eligibilityCriteria.minAge != null)
    data.minAge = Number(eligibilityCriteria.minAge);
  if (eligibilityCriteria.maxAge != null)
    data.maxAge = Number(eligibilityCriteria.maxAge);

  if (eligibilityCriteria.entranceExamName)
    data.entranceExamName = eligibilityCriteria.entranceExamName;
  if (eligibilityCriteria.minEntranceScore != null)
    data.minEntranceScore = Number(eligibilityCriteria.minEntranceScore);

  if (eligibilityCriteria.isFirstGenerationLearner != null)
    data.isFirstGenerationLearner = Boolean(
      eligibilityCriteria.isFirstGenerationLearner
    );
  if (eligibilityCriteria.minAttendancePercent != null)
    data.minAttendancePercent = Number(
      eligibilityCriteria.minAttendancePercent
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

// ─── Service Methods ──────────────────────────────────────────────────────────

export const createScholarship = async ({ userId, body }) => {
  const institution = await InstitutionProfile.findOne({ user: userId });
  if (!institution)
    throw new AppError("Institution profile not found.", 404);

  if (institution.verification?.status !== "verified")
    throw new AppError("Only verified institutions can post scholarships.", 403);

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
  } = body;

  if (!scholarshipTitle || !applicationDeadline)
    throw new AppError("scholarshipTitle and applicationDeadline are required.", 400);

  if (
    coverage?.scholarshipType2 &&
    !VALID_TYPES.includes(coverage.scholarshipType2)
  )
    throw new AppError(
      `Invalid scholarshipType2. Must be one of: ${VALID_TYPES.join(", ")}`,
      400
    );

  const eligibilityErrors = validateEligibilityExtras(eligibilityCriteria);
  if (eligibilityErrors.length > 0)
    throw new AppError(eligibilityErrors.join(" "), 400);

  const builtEligibility = buildEligibility(eligibilityCriteria);

  const parsedTotalSeats = totalSeats ? Number(totalSeats) : undefined;
  const parsedRemainingSeats = remainingSeats
    ? Number(remainingSeats)
    : parsedTotalSeats;

  if (
    parsedTotalSeats !== undefined &&
    parsedRemainingSeats !== undefined &&
    parsedRemainingSeats > parsedTotalSeats
  ) {
    throw new AppError("remainingSeats cannot exceed totalSeats.", 400);
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
    eligibilityCriteria: builtEligibility,
    ...(parsedTotalSeats !== undefined && { totalSeats: parsedTotalSeats }),
    ...(parsedRemainingSeats !== undefined && {
      remainingSeats: parsedRemainingSeats,
    }),
    locationFilter: resolvedLocation,
    isActive: true,
    isDeleted: false,
    verification: { status: "pending" },
  });

  return scholarship;
};

export const getAllScholarships = async (query = {}) => {
  const {
    search,
    subject,
    targetLevel,
    targetFaculty,
    degreeProgram,
    university,
    collegeType,
    scholarshipType,
    gender,
    ethnicCategory,
    hasDisability,
    province,
    district,
    municipality,
    minAmount,
    maxAmount,
    includeExpired,
    sort = "deadline",
    page = 1,
    limit = 12,
  } = query;

  const mongoQuery = {
    isDeleted: false,
    isActive: true,
    "verification.status": "approved",
  };

  if (includeExpired !== "true") {
    mongoQuery.applicationDeadline = { $gte: new Date() };
  }

  if (search) {
    mongoQuery.$text = { $search: search };
  }

  if (subject) {
    mongoQuery["eligibilityCriteria.subject"] = { $regex: subject, $options: "i" };
  }
  if (targetLevel) {
    mongoQuery["eligibilityCriteria.targetLevel"] = targetLevel;
  }
  if (targetFaculty) {
    mongoQuery["eligibilityCriteria.targetFaculty"] = {
      $regex: targetFaculty,
      $options: "i",
    };
  }
  if (degreeProgram) {
    mongoQuery["eligibilityCriteria.degreeProgram"] = {
      $regex: degreeProgram,
      $options: "i",
    };
  }
  if (university) {
    mongoQuery["eligibilityCriteria.university"] = {
      $regex: university,
      $options: "i",
    };
  }
  if (collegeType) {
    mongoQuery["eligibilityCriteria.collegeType"] = collegeType;
  }
  if (scholarshipType) {
    mongoQuery["coverage.scholarshipType2"] = scholarshipType;
  }
  if (gender && gender !== "any") {
    mongoQuery["eligibilityCriteria.gender"] = { $in: [gender, "any"] };
  }
  if (ethnicCategory && ethnicCategory !== "any") {
    mongoQuery["eligibilityCriteria.ethnicCategory"] = {
      $in: [ethnicCategory, "any"],
    };
  }
  if (hasDisability === "true") {
    mongoQuery["eligibilityCriteria.hasDisability"] = true;
  }

  if (province) {
    mongoQuery["locationFilter.province.provinceName"] = province;
  }
  if (district) {
    mongoQuery["locationFilter.district.districtName"] = district;
  }
  if (municipality) {
    mongoQuery["locationFilter.municipality.municipalityName"] = municipality;
  }

  if (minAmount || maxAmount) {
    mongoQuery["coverage.amountNpr"] = {};
    if (minAmount) mongoQuery["coverage.amountNpr"].$gte = Number(minAmount);
    if (maxAmount) mongoQuery["coverage.amountNpr"].$lte = Number(maxAmount);
  }

  const sortMap = {
    deadline: { applicationDeadline: 1 },
    newest: { createdAt: -1 },
    amount: { "coverage.amountNpr": -1 },
  };
  const sortSpec = sortMap[sort] || sortMap.deadline;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));

  const [scholarships, total] = await Promise.all([
    Scholarship.find(mongoQuery)
      .sort(sortSpec)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Scholarship.countDocuments(mongoQuery),
  ]);

  return {
    scholarships,
    total,
    page: pageNum,
    pages: Math.max(1, Math.ceil(total / limitNum)),
  };
};

export const getMyScholarships = async ({ userId, search }) => {
  const institution = await InstitutionProfile.findOne({ user: userId });
  if (!institution)
    throw new AppError("Institution not found.", 404);

  const filter = {
    institutionId: institution._id,
    isDeleted: { $ne: true },
  };

  if (search?.trim()) {
    filter.$and = (filter.$and || []).concat(buildSearchClauses(search));
  }

  const scholarships = await Scholarship.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return { count: scholarships.length, scholarships };
};

export const getScholarshipById = async (id) => {
  const scholarship = await Scholarship.findOne({
    _id: id,
    isDeleted: { $ne: true },
    "verification.status": "approved",
  })
    .populate(
      "institutionId",
      "institutionName location contactPerson website"
    )
    .lean();

  if (!scholarship)
    throw new AppError("Scholarship not found.", 404);

  return scholarship;
};

export const updateScholarship = async ({ userId, id, body }) => {
  const institution = await InstitutionProfile.findOne({ user: userId });
  if (!institution)
    throw new AppError("Institution not found.", 404);

  const scholarship = await Scholarship.findOne({
    _id: id,
    institutionId: institution._id,
    isDeleted: { $ne: true },
  });

  if (!scholarship)
    throw new AppError("Scholarship not found.", 404);

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
  } = body;

  if (scholarshipTitle !== undefined && !scholarshipTitle)
    throw new AppError("scholarshipTitle cannot be empty.", 400);

  if (applicationDeadline !== undefined && !applicationDeadline)
    throw new AppError("applicationDeadline cannot be empty.", 400);

  if (
    coverage?.scholarshipType2 &&
    !VALID_TYPES.includes(coverage.scholarshipType2)
  )
    throw new AppError(
      `Invalid scholarshipType2. Must be one of: ${VALID_TYPES.join(", ")}`,
      400
    );

  let builtEligibility;
  if (eligibilityCriteria !== undefined) {
    const eligibilityErrors = validateEligibilityExtras(eligibilityCriteria);
    if (eligibilityErrors.length > 0)
      throw new AppError(eligibilityErrors.join(" "), 400);

    builtEligibility = buildEligibility(eligibilityCriteria);
  }

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
    throw new AppError("remainingSeats cannot exceed totalSeats.", 400);
  }

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

  if (coverage !== undefined) scholarship.coverage = buildCoverage(coverage);
  if (eligibilityCriteria !== undefined)
    scholarship.eligibilityCriteria = builtEligibility;
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
  return scholarship;
};

export const deleteScholarship = async ({ userId, id }) => {
  const institution = await InstitutionProfile.findOne({ user: userId });
  if (!institution)
    throw new AppError("Institution not found.", 404);

  const scholarship = await Scholarship.findOne({
    _id: id,
    institutionId: institution._id,
    isDeleted: { $ne: true },
  });

  if (!scholarship)
    throw new AppError("Scholarship not found.", 404);

  scholarship.isDeleted = true;
  scholarship.deletedAt = new Date();
  scholarship.isActive = false;
  await scholarship.save();

  return true;
};
