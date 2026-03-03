// scholarshipController.js — Scholarship management
//
// Public handlers (no auth):
//   listScholarships   GET  /api/scholarships
//   getScholarshipById GET  /api/scholarships/:id
//
// Protected (college role only):
//   getMyScholarships  GET  /api/scholarships/my
//   createScholarship  POST /api/scholarships
//   updateScholarship  PUT  /api/scholarships/:id
//   deleteScholarship  DEL  /api/scholarships/:id

const asyncHandler = require('../utils/asyncHandler');
const paginate     = require('../utils/paginate');
const Scholarship  = require('../models/Scholarship');
const College      = require('../models/College');

// Fields a college cannot set directly —
// statistics are only updated via $inc from applicationController
const BLOCKED_UPDATE_FIELDS = [
  'collegeId', 'collegeName', 'statistics', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt',
];

// ─────────────────────────────────────────────────────────────────
// Helper — resolves the College document for the logged-in user.
// Throws a 404 if no profile exists.
// ─────────────────────────────────────────────────────────────────
const _getCollegeForUser = async (userId) => {
  const college = await College.findOne({ userId });
  if (!college) {
    const err = new Error('College profile not found.');
    err.statusCode = 404;
    throw err;
  }
  return college;
};

// ─────────────────────────────────────────────────────────────────
// GET /api/scholarships  (PUBLIC)
// Lists active, non-deleted scholarships with pagination.
//
// Query params:
//   ?type=merit|reservation|both
//   ?province=<provinceId>
//   ?deadline=upcoming          (applicationDeadline >= now)
//   ?search=<text>              (full-text on title + description)
//   ?page=1&limit=10
// ─────────────────────────────────────────────────────────────────
exports.listScholarships = asyncHandler(async (req, res) => {
  const { type, province, deadline, search, page, limit } = req.query;

  const query = {
    isActive:  true,
    isDeleted: false,
  };

  if (type)     query.scholarshipType = type;

  if (province) query['locationFilter.province.provinceId'] = province;

  if (deadline === 'upcoming') {
    query.applicationDeadline = { $gte: new Date() };
  }

  if (search)   query.$text = { $search: search };

  const result = await paginate(Scholarship, query, {
    page,
    limit,
    sort:   search
      ? { score: { $meta: 'textScore' } }
      : { applicationDeadline: 1 },       // soonest deadline first by default
    select: 'scholarshipTitle scholarshipType collegeName financialDetails applicationDeadline locationFilter statistics isActive',
  });

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/scholarships/my  (college only)
// Returns ALL the college's own scholarships (active, inactive, deleted)
// for dashboard management — unfiltered by status.
// ─────────────────────────────────────────────────────────────────
exports.getMyScholarships = asyncHandler(async (req, res) => {
  // req.user._id is the User doc _id, not College._id
  // Must resolve College._id first
  const college = await _getCollegeForUser(req.user._id);

  const { page, limit } = req.query;

  const result = await paginate(
    Scholarship,
    { collegeId: college._id },
    {
      page,
      limit,
      sort: { createdAt: -1 },
      select: 'scholarshipTitle scholarshipType financialDetails applicationDeadline isActive isDeleted statistics',
    }
  );

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/scholarships/:id  (PUBLIC)
// Returns a single active, non-deleted scholarship.
// ─────────────────────────────────────────────────────────────────
exports.getScholarshipById = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findOne({
    _id:       req.params.id,
    isActive:  true,
    isDeleted: false,
  });

  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found.',
    });
  }

  res.json({ success: true, data: scholarship });
});

// ─────────────────────────────────────────────────────────────────
// POST /api/scholarships  (college only)
// Creates a new scholarship.
// Requires college to be 'verified' — unverified colleges cannot post.
// availableSlots is initialised to totalSlots on creation.
// ─────────────────────────────────────────────────────────────────
exports.createScholarship = asyncHandler(async (req, res) => {
  const college = await _getCollegeForUser(req.user._id);

  // Guard — only verified colleges may post scholarships
  if (college.verification.status !== 'verified') {
    return res.status(403).json({
      success: false,
      message: `Your college must be verified before posting scholarships. Current status: ${college.verification.status}.`,
    });
  }

  const {
    scholarshipTitle,
    description,
    scholarshipType,
    financialDetails,
    requirements,
    applicationDeadline,
    locationFilter,
  } = req.body;

  // Validate required fields
  if (!scholarshipTitle || !scholarshipType || !applicationDeadline) {
    return res.status(400).json({
      success: false,
      message: 'scholarshipTitle, scholarshipType, and applicationDeadline are required.',
    });
  }

  // Deadline must be in the future
  if (new Date(applicationDeadline) <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'applicationDeadline must be a future date.',
    });
  }

  // Set availableSlots = totalSlots on creation
  const resolvedFinancialDetails = financialDetails
    ? {
        ...financialDetails,
        availableSlots: financialDetails.totalSlots ?? financialDetails.availableSlots,
      }
    : undefined;

  const scholarship = await Scholarship.create({
    collegeId:        college._id,
    collegeName:      college.collegeName,   // denormalized — no populate needed in listings
    scholarshipTitle,
    description,
    scholarshipType,
    financialDetails: resolvedFinancialDetails,
    requirements,
    applicationDeadline,
    locationFilter,
  });

  res.status(201).json({
    success: true,
    message: 'Scholarship created successfully.',
    data:    scholarship,
  });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/scholarships/:id  (college only)
// Updates the college's own scholarship.
// Ownership verified — a college cannot edit another college's scholarship.
// If totalSlots changes, availableSlots is recalculated proportionally.
// ─────────────────────────────────────────────────────────────────
exports.updateScholarship = asyncHandler(async (req, res) => {
  const college = await _getCollegeForUser(req.user._id);

  // Find the scholarship and confirm ownership
  const existing = await Scholarship.findOne({
    _id:       req.params.id,
    isDeleted: false,
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found.',
    });
  }

  if (existing.collegeId.toString() !== college._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit this scholarship.',
    });
  }

  // Strip blocked fields
  const body = { ...req.body };
  BLOCKED_UPDATE_FIELDS.forEach((field) => delete body[field]);

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No updatable fields provided.',
    });
  }

  // If totalSlots is being changed, update availableSlots to match
  // (preserve any slots already consumed by approved applications)
  if (body.financialDetails?.totalSlots !== undefined) {
    const newTotal    = body.financialDetails.totalSlots;
    const approved    = existing.statistics.approvedApplications;
    const newAvailable = Math.max(0, newTotal - approved);

    body.financialDetails = {
      ...body.financialDetails,
      availableSlots: newAvailable,
    };
  }

  // Validate new deadline if provided
  if (body.applicationDeadline && new Date(body.applicationDeadline) <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'applicationDeadline must be a future date.',
    });
  }

  const scholarship = await Scholarship.findByIdAndUpdate(
    req.params.id,
    { $set: body },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Scholarship updated successfully.',
    data:    scholarship,
  });
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/scholarships/:id  (college only)
// Soft-deletes the scholarship — sets isDeleted:true + isActive:false.
// Ownership verified.
// ─────────────────────────────────────────────────────────────────
exports.deleteScholarship = asyncHandler(async (req, res) => {
  const college = await _getCollegeForUser(req.user._id);

  const existing = await Scholarship.findOne({
    _id:       req.params.id,
    isDeleted: false,
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found.',
    });
  }

  if (existing.collegeId.toString() !== college._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this scholarship.',
    });
  }

  await Scholarship.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    isActive:  false,
    deletedAt: new Date(),
  });

  res.json({
    success: true,
    message: 'Scholarship deleted successfully.',
  });
});