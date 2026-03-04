// adminController.js — Admin and ProvincialAdmin management endpoints
//
// Shared (admin + provincial_admin):
//   getPendingColleges  GET  /api/admin/colleges/pending
//   verifyCollege       PUT  /api/admin/colleges/:id/verify
//   rejectCollege       PUT  /api/admin/colleges/:id/reject
//   getStats            GET  /api/admin/stats
//
// Admin only:
//   listUsers           GET  /api/admin/users
//   deactivateUser      PUT  /api/admin/users/:id/deactivate

const asyncHandler      = require('../utils/asyncHandler');
const paginate          = require('../utils/paginate');
const College           = require('../models/College');
const User              = require('../models/User');
const Student           = require('../models/Student');
const Scholarship       = require('../models/Scholarship');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const ProvincialAdmin   = require('../models/ProvincialAdmin');

// ─────────────────────────────────────────────────────────────────
// Helper — if the acting user is a provincial_admin, resolves their
// ProvincialAdmin profile (needed for province scoping + verifiedBy).
// Returns null for full admins (no province restriction).
// ─────────────────────────────────────────────────────────────────
const _getProvincialAdmin = async (user) => {
  if (user.userType !== 'provincial_admin') return null;
  const pa = await ProvincialAdmin.findOne({ userId: user._id });
  if (!pa) {
    const err = new Error('Provincial admin profile not found.');
    err.statusCode = 404;
    throw err;
  }
  return pa;
};

// ─────────────────────────────────────────────────────────────────
// Helper — builds the province scope filter for a provincial_admin.
// Admin gets an empty filter (sees everything).
// ─────────────────────────────────────────────────────────────────
const _provinceFilter = (provincialAdmin) => {
  if (!provincialAdmin) return {};
  return {
    'location.province.provinceId': provincialAdmin.province.provinceId,
  };
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/colleges/pending
// Lists colleges awaiting verification.
// provincial_admin: scoped to their province only.
// admin: all provinces.
// ─────────────────────────────────────────────────────────────────
exports.getPendingColleges = asyncHandler(async (req, res) => {
  const pa = await _getProvincialAdmin(req.user);
  const { page, limit } = req.query;

  const query = {
    'verification.status': 'pending',
    isDeleted:             false,
    ..._provinceFilter(pa),
  };

  const result = await paginate(College, query, {
    page,
    limit,
    sort:   { createdAt: 1 },   // oldest first — FIFO review queue
    select: 'collegeName location contactInfo verification createdAt',
  });

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/admin/colleges/:id/verify
// Marks a college as verified.
// provincial_admin: can only verify colleges in their province.
// Sets verification.verifiedBy to the ProvincialAdmin doc _id.
// ─────────────────────────────────────────────────────────────────
exports.verifyCollege = asyncHandler(async (req, res) => {
  const pa = await _getProvincialAdmin(req.user);

  const college = await College.findOne({
    _id:       req.params.id,
    isDeleted: false,
  });

  if (!college) {
    return res.status(404).json({ success: false, message: 'College not found.' });
  }

  // Province ownership check for provincial_admin
  if (pa) {
    const collegeProvinceId = college.location?.province?.provinceId?.toString();
    if (collegeProvinceId !== pa.province.provinceId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only verify colleges within your province.',
      });
    }
  }

  // Idempotency — already verified
  if (college.verification.status === 'verified') {
    return res.status(409).json({
      success: false,
      message: 'College is already verified.',
    });
  }

  const updated = await College.findByIdAndUpdate(
    req.params.id,
    {
      'verification.status':     'verified',
      'verification.verifiedBy': pa ? pa._id : null,   // null for full admin
      'verification.verifiedAt': new Date(),
      $unset: { 'verification.rejectionReason': '' },  // clear any prior rejection
    },
    { new: true, select: 'collegeName verification location' }
  );

  res.json({
    success: true,
    message: `${updated.collegeName} has been verified.`,
    data:    updated,
  });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/admin/colleges/:id/reject
// Rejects a college — requires rejectionReason in body.
// provincial_admin: province ownership check applies.
// ─────────────────────────────────────────────────────────────────
exports.rejectCollege = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'rejectionReason is required when rejecting a college.',
    });
  }

  const pa = await _getProvincialAdmin(req.user);

  const college = await College.findOne({
    _id:       req.params.id,
    isDeleted: false,
  });

  if (!college) {
    return res.status(404).json({ success: false, message: 'College not found.' });
  }

  // Province ownership check
  if (pa) {
    const collegeProvinceId = college.location?.province?.provinceId?.toString();
    if (collegeProvinceId !== pa.province.provinceId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject colleges within your province.',
      });
    }
  }

  // Already rejected — idempotent update still allowed (reason may be updated)
  const updated = await College.findByIdAndUpdate(
    req.params.id,
    {
      'verification.status':          'rejected',
      'verification.rejectionReason': rejectionReason.trim(),
      'verification.verifiedBy':      pa ? pa._id : null,
      'verification.verifiedAt':      new Date(),
    },
    { new: true, select: 'collegeName verification location' }
  );

  res.json({
    success: true,
    message: `${updated.collegeName} has been rejected.`,
    data:    updated,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/users  (admin only)
// Lists all user accounts. Passwords never returned (select:false).
// Optional: ?userType=admin|provincial_admin|college|student
//           ?isActive=true|false
// ─────────────────────────────────────────────────────────────────
exports.listUsers = asyncHandler(async (req, res) => {
  const { userType, isActive, page, limit } = req.query;

  const query = {};
  if (userType) query.userType = userType;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const result = await paginate(User, query, {
    page,
    limit,
    sort:   { createdAt: -1 },
    select: 'email userType isActive emailVerified lastLogin createdAt',
    // password has select:false in schema — never returned even without explicit exclusion
  });

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id/deactivate  (admin only)
// Deactivates a user account (sets isActive:false).
// Guards: cannot deactivate self, cannot deactivate another admin.
// ─────────────────────────────────────────────────────────────────
exports.deactivateUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  // Cannot deactivate yourself
  if (targetId === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account.',
    });
  }

  const targetUser = await User.findById(targetId);

  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Cannot deactivate another admin
  if (targetUser.userType === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be deactivated through this endpoint.',
    });
  }

  if (!targetUser.isActive) {
    return res.status(409).json({
      success: false,
      message: 'User account is already deactivated.',
    });
  }

  const updated = await User.findByIdAndUpdate(
    targetId,
    { isActive: false },
    { new: true, select: 'email userType isActive' }
  );

  res.json({
    success: true,
    message: `Account for ${updated.email} has been deactivated.`,
    data:    updated,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Platform-wide statistics fetched in parallel.
// provincial_admin: college + scholarship counts scoped to their province.
// admin: all provinces.
// ─────────────────────────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const pa           = await _getProvincialAdmin(req.user);
  const provinceFilter = _provinceFilter(pa);

  // Build province-scoped filters for college-linked entities
  const collegeFilter = { isDeleted: false, ...provinceFilter };

  // For province-scoped scholarship stats, first get verified college IDs in province
  let scholarshipScopeFilter = { isDeleted: false };
  if (pa) {
    const provinceColleges = await College.find(
      { 'location.province.provinceId': pa.province.provinceId, isDeleted: false },
      { _id: 1 }
    ).lean();
    const collegeIds = provinceColleges.map((c) => c._id);
    scholarshipScopeFilter.collegeId = { $in: collegeIds };
  }

  // Fetch all counts in parallel
  const [
    pendingColleges,
    verifiedColleges,
    rejectedColleges,
    totalStudents,
    activeScholarships,
    totalScholarships,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    totalUsers,
  ] = await Promise.all([
    College.countDocuments({ ...collegeFilter, 'verification.status': 'pending'  }),
    College.countDocuments({ ...collegeFilter, 'verification.status': 'verified' }),
    College.countDocuments({ ...collegeFilter, 'verification.status': 'rejected' }),
    pa ? 0 : Student.countDocuments({ isDeleted: false }),            // students not province-scoped
    Scholarship.countDocuments({ ...scholarshipScopeFilter, isActive: true  }),
    Scholarship.countDocuments({  ...scholarshipScopeFilter }),
    ScholarshipApplication.countDocuments({ applicationStatus: 'pending'  }),
    ScholarshipApplication.countDocuments({ applicationStatus: 'approved' }),
    ScholarshipApplication.countDocuments({ applicationStatus: 'rejected' }),
    pa ? 0 : User.countDocuments({}),                                 // user count admin-only
  ]);

  res.json({
    success: true,
    data: {
      scope: pa
        ? { type: 'province', provinceName: pa.province.provinceName }
        : { type: 'platform' },
      colleges: {
        pending:  pendingColleges,
        verified: verifiedColleges,
        rejected: rejectedColleges,
        total:    pendingColleges + verifiedColleges + rejectedColleges,
      },
      students: {
        total: totalStudents,
      },
      scholarships: {
        active: activeScholarships,
        total:  totalScholarships,
      },
      applications: {
        pending:  pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
      },
      ...(pa ? {} : { users: { total: totalUsers } }),
    },
  });
});

// adminController.js — after verifyCollege:
createNotification({ userId: college.userId, notificationType: 'college_verified',
    title: 'Your college has been verified', priority: 'high'
});
  