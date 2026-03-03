// collegeController.js — College profile management
//
// Protected handlers (college role only):
//   getMyProfile     GET  /api/college/profile
//   updateMyProfile  PUT  /api/college/profile
//   getVerification  GET  /api/college/verification
//   addCourse        POST /api/college/courses
//   removeCourse     DEL  /api/college/courses/:courseId
//
// Public handlers (no auth):
//   listColleges     GET  /api/college/list
//   getCollegeById   GET  /api/college/:id

const asyncHandler = require('../utils/asyncHandler');
const paginate     = require('../utils/paginate');
const College      = require('../models/College');

// Fields a college CANNOT update themselves —
// only admins/system can touch these
const BLOCKED_UPDATE_FIELDS = [
  'userId', 'verification', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt',
];

// ─────────────────────────────────────────────────────────────────
// GET /api/college/profile
// Returns the full profile of the logged-in college
// ─────────────────────────────────────────────────────────────────
exports.getMyProfile = asyncHandler(async (req, res) => {
  const college = await College.findOne({ userId: req.user._id });

  if (!college) {
    return res.status(404).json({
      success: false,
      message: 'College profile not found. Please contact support.',
    });
  }

  res.json({ success: true, data: college });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/college/profile
// Update allowed profile fields — blocks verification, userId, etc.
// Supports partial updates — only provided fields are changed.
// ─────────────────────────────────────────────────────────────────
exports.updateMyProfile = asyncHandler(async (req, res) => {
  // Strip any fields the college cannot self-update
  const body = { ...req.body };
  BLOCKED_UPDATE_FIELDS.forEach((field) => delete body[field]);

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No updatable fields provided.',
    });
  }

  const college = await College.findOneAndUpdate(
    { userId: req.user._id },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!college) {
    return res.status(404).json({
      success: false,
      message: 'College profile not found.',
    });
  }

  res.json({ success: true, data: college });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/college/verification
// Returns just the verification sub-document — useful for dashboard
// status banners without fetching the entire profile
// ─────────────────────────────────────────────────────────────────
exports.getVerification = asyncHandler(async (req, res) => {
  const college = await College
    .findOne({ userId: req.user._id })
    .select('collegeName verification');

  if (!college) {
    return res.status(404).json({
      success: false,
      message: 'College profile not found.',
    });
  }

  res.json({
    success: true,
    data: {
      collegeName:  college.collegeName,
      verification: college.verification,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// POST /api/college/courses
// Adds a new course to the courses embedded array
// Body: { courseName, courseLevel, duration?, description? }
// ─────────────────────────────────────────────────────────────────
exports.addCourse = asyncHandler(async (req, res) => {
  const { courseName, courseLevel, duration, description } = req.body;

  if (!courseName || !courseLevel) {
    return res.status(400).json({
      success: false,
      message: 'courseName and courseLevel are required.',
    });
  }

  const validLevels = ['Undergraduate', 'Graduate', 'Postgraduate', 'Diploma', 'Certificate'];
  if (!validLevels.includes(courseLevel)) {
    return res.status(400).json({
      success: false,
      message: `courseLevel must be one of: ${validLevels.join(', ')}.`,
    });
  }

  const college = await College.findOneAndUpdate(
    { userId: req.user._id },
    {
      $push: {
        courses: {
          courseName,
          courseLevel,
          duration:    duration    || undefined,
          description: description || undefined,
        },
      },
    },
    { new: true, runValidators: true }
  );

  if (!college) {
    return res.status(404).json({
      success: false,
      message: 'College profile not found.',
    });
  }

  // Return only the newly added course (last item)
  const newCourse = college.courses[college.courses.length - 1];

  res.status(201).json({
    success:  true,
    message:  'Course added successfully.',
    data:     newCourse,
    total:    college.courses.length,
  });
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/college/courses/:courseId
// Removes a course from the courses array by its sub-document _id
// ─────────────────────────────────────────────────────────────────
exports.removeCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const college = await College.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { courses: { _id: courseId } } },
    { new: true }
  );

  if (!college) {
    return res.status(404).json({
      success: false,
      message: 'College profile not found.',
    });
  }

  res.json({
    success: true,
    message: 'Course removed successfully.',
    total:   college.courses.length,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/college/list  (PUBLIC)
// Lists verified, non-deleted colleges with pagination.
//
// Query params:
//   ?province=<provinceId>   filter by province
//   ?search=<text>           full-text search on name + description
//   ?page=1&limit=10
// ─────────────────────────────────────────────────────────────────
exports.listColleges = asyncHandler(async (req, res) => {
  const { province, search, page, limit } = req.query;

  // Base query — only verified, non-deleted colleges are public
  const query = {
    'verification.status': 'verified',
    isDeleted:             false,
  };

  // Province filter
  if (province) {
    query['location.province.provinceId'] = province;
  }

  // Full-text search (uses the text index on collegeName + about.description)
  if (search) {
    query.$text = { $search: search };
  }

  const result = await paginate(College, query, {
    page,
    limit,
    sort:     search ? { score: { $meta: 'textScore' } } : { collegeName: 1 },
    select:   'collegeName location contactInfo about.description courses verification.status',
    populate: [],
  });

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/college/:id  (PUBLIC)
// Returns a single verified college's full public profile.
// Returns 404 if deleted or not yet verified — not exposed publicly.
// ─────────────────────────────────────────────────────────────────
exports.getCollegeById = asyncHandler(async (req, res) => {
  const college = await College
    .findOne({
      _id:                   req.params.id,
      'verification.status': 'verified',
      isDeleted:             false,
    })
    .select('-verification.rejectionReason -verification.verifiedBy -isDeleted -deletedAt');

  if (!college) {
    return res.status(404).json({
      success: false,
      message: 'College not found.',
    });
  }

  res.json({ success: true, data: college });
});