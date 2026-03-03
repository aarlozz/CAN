// applicationController.js — Scholarship application management
//
// Student handlers:
//   submitApplication              POST   /api/applications
//   getMyApplications              GET    /api/applications/my
//   withdrawApplication            DELETE /api/applications/:id
//
// College handlers:
//   getApplicationsForScholarship  GET    /api/applications/scholarship/:scholarshipId
//   reviewApplication              PUT    /api/applications/:id/review

const asyncHandler           = require('../utils/asyncHandler');
const paginate               = require('../utils/paginate');
const ScholarshipApplication = require('../models/Scholarshipapplication');
const Scholarship            = require('../models/Scholarship');
const Student                = require('../models/Student');
const College                = require('../models/College');

// ─────────────────────────────────────────────────────────────────
// Helper — resolve Student profile from User._id, throw 404 if missing
// ─────────────────────────────────────────────────────────────────
const _getStudentForUser = async (userId) => {
  const student = await Student.findOne({ userId });
  if (!student) {
    const err = new Error('Student profile not found.');
    err.statusCode = 404;
    throw err;
  }
  return student;
};

// ─────────────────────────────────────────────────────────────────
// Helper — resolve College profile from User._id, throw 404 if missing
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
// Helper — build an immutable snapshot of the student at apply-time.
// Capturing this means profile edits after applying don't affect
// what the college sees when reviewing.
// ─────────────────────────────────────────────────────────────────
const _buildSnapshot = (student, userEmail) => ({
  fullName:    student.personalInfo?.fullName,
  gender:      student.personalInfo?.gender,
  dateOfBirth: student.personalInfo?.dateOfBirth,
  phone:       student.personalInfo?.phone,
  email:       userEmail,
  location: {
    province:     student.location?.province?.provinceName,
    district:     student.location?.district?.districtName,
    municipality: student.location?.municipality?.municipalityName,
    addressLine:  student.location?.addressLine,
  },
  educationInfo: {
    schoolName:            student.educationInfo?.schoolName,
    schoolType:            student.educationInfo?.schoolType,
    currentEducationLevel: student.educationInfo?.currentEducationLevel,
  },
  reservationInfo: {
    caste:          student.reservationInfo?.caste,
    hasDisability:  student.reservationInfo?.hasDisability,
    disabilityType: student.reservationInfo?.disabilityType,
  },
  guardianInfo: {
    name:  student.guardianInfo?.name,
    phone: student.guardianInfo?.phone,
  },
  snapshotCreatedAt: new Date(),
});

// ─────────────────────────────────────────────────────────────────
// POST /api/applications  (student only)
// Submits a new scholarship application.
//
// Body: { scholarshipId, applicationType, meritDetails?, reservationDetails?, documents? }
//
// Guards (in order):
//   1. Scholarship must exist, be active, not deleted
//   2. Deadline must not have passed
//   3. applicationType must be valid for scholarship.scholarshipType
//   4. No duplicate application (friendly pre-check before unique-index error)
//   5. Available slots must be > 0
// ─────────────────────────────────────────────────────────────────
exports.submitApplication = asyncHandler(async (req, res) => {
  const { scholarshipId, applicationType, meritDetails, reservationDetails, documents } = req.body;

  if (!scholarshipId || !applicationType) {
    return res.status(400).json({
      success: false,
      message: 'scholarshipId and applicationType are required.',
    });
  }

  // 1. Resolve student
  const student = await _getStudentForUser(req.user._id);

  // 2. Resolve scholarship — active and not deleted
  const scholarship = await Scholarship.findOne({
    _id:       scholarshipId,
    isActive:  true,
    isDeleted: false,
  });

  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found or is no longer active.',
    });
  }

  // 3. Deadline check
  if (new Date() > new Date(scholarship.applicationDeadline)) {
    return res.status(400).json({
      success: false,
      message: 'The application deadline for this scholarship has passed.',
    });
  }

  // 4. applicationType must be compatible with scholarshipType
  const typeMap = {
    merit:       ['merit'],
    reservation: ['reservation'],
    both:        ['merit', 'reservation'],
  };
  if (!typeMap[scholarship.scholarshipType]?.includes(applicationType)) {
    return res.status(400).json({
      success: false,
      message: `This scholarship accepts ${scholarship.scholarshipType} applications only. You submitted: ${applicationType}.`,
    });
  }

  // 5. Duplicate check — friendly error before unique index fires
  const existing = await ScholarshipApplication.findOne({
    scholarshipId,
    studentId: student._id,
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You have already applied for this scholarship.',
    });
  }

  // 6. Available slots check
  const available = scholarship.financialDetails?.availableSlots;
  if (available !== undefined && available !== null && available <= 0) {
    return res.status(400).json({
      success: false,
      message: 'No available slots remain for this scholarship.',
    });
  }

  // 7. Build immutable student snapshot
  const studentSnapshot = _buildSnapshot(student, req.user.email);

  // 8. Create application
  const application = await ScholarshipApplication.create({
    scholarshipId,
    studentId:   student._id,
    applicationType,
    studentSnapshot,
    meritDetails:       applicationType === 'merit'       ? meritDetails       : undefined,
    reservationDetails: applicationType === 'reservation' ? reservationDetails : undefined,
    documents:          documents || [],
  });

  // 9. Increment scholarship statistics atomically
  await Scholarship.findByIdAndUpdate(scholarshipId, {
    $inc: {
      'statistics.totalApplications':   1,
      'statistics.pendingApplications': 1,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully.',
    data:    application,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/applications/my  (student only)
// Returns the logged-in student's own applications, paginated.
// Optional: ?status=pending|under_review|approved|rejected|withdrawn
// ─────────────────────────────────────────────────────────────────
exports.getMyApplications = asyncHandler(async (req, res) => {
  const student = await _getStudentForUser(req.user._id);

  const { status, page, limit } = req.query;

  const query = { studentId: student._id };
  if (status) query.applicationStatus = status;

  const result = await paginate(ScholarshipApplication, query, {
    page,
    limit,
    sort:     { appliedAt: -1 },
    select:   'scholarshipId applicationType applicationStatus appliedAt studentSnapshot.fullName review.reviewedAt',
    populate: [{ path: 'scholarshipId', select: 'scholarshipTitle collegeName applicationDeadline' }],
  });

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/applications/:id  (student only)
// Withdraws an application — only allowed when status is 'pending'.
// Decrements scholarship.statistics.pendingApplications.
// ─────────────────────────────────────────────────────────────────
exports.withdrawApplication = asyncHandler(async (req, res) => {
  const student = await _getStudentForUser(req.user._id);

  // Find by id AND studentId — prevents withdrawing another student's application
  const application = await ScholarshipApplication.findOne({
    _id:       req.params.id,
    studentId: student._id,
  });

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found.',
    });
  }

  if (application.applicationStatus !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Only pending applications can be withdrawn. Current status: ${application.applicationStatus}.`,
    });
  }

  // Set to withdrawn
  application.applicationStatus = 'withdrawn';
  await application.save();

  // Decrement pending count on scholarship
  await Scholarship.findByIdAndUpdate(application.scholarshipId, {
    $inc: { 'statistics.pendingApplications': -1 },
  });

  res.json({
    success: true,
    message: 'Application withdrawn successfully.',
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/applications/scholarship/:scholarshipId  (college only)
// Returns all applications for one of the college's scholarships.
// College ownership of the scholarship is verified first.
// Optional: ?status=pending|under_review|approved|rejected|withdrawn
// ─────────────────────────────────────────────────────────────────
exports.getApplicationsForScholarship = asyncHandler(async (req, res) => {
  const { scholarshipId } = req.params;
  const { status, page, limit } = req.query;

  const college = await _getCollegeForUser(req.user._id);

  // Verify college owns this scholarship
  const scholarship = await Scholarship.findOne({
    _id:       scholarshipId,
    isDeleted: false,
  });

  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found.',
    });
  }

  if (scholarship.collegeId.toString() !== college._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view applications for this scholarship.',
    });
  }

  const query = { scholarshipId };
  if (status) query.applicationStatus = status;

  const result = await paginate(ScholarshipApplication, query, {
    page,
    limit,
    sort:   { appliedAt: -1 },
    select: 'applicationType applicationStatus studentSnapshot appliedAt meritDetails reservationDetails documents review',
  });

  res.json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/applications/:id/review  (college only)
// Approves or rejects an application.
// Only 'pending' or 'under_review' applications can be reviewed.
//
// Body: { decision: 'approved'|'rejected', rejectionReason?, internalNotes? }
//
// On approve:
//   — statistics.approvedApplications +1
//   — statistics.pendingApplications  -1
//   — financialDetails.availableSlots -1
// On reject:
//   — statistics.pendingApplications  -1
// ─────────────────────────────────────────────────────────────────
exports.reviewApplication = asyncHandler(async (req, res) => {
  const { decision, rejectionReason, internalNotes } = req.body;

  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "decision must be 'approved' or 'rejected'.",
    });
  }

  if (decision === 'rejected' && !rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'rejectionReason is required when rejecting an application.',
    });
  }

  const college = await _getCollegeForUser(req.user._id);

  // Find the application
  const application = await ScholarshipApplication.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found.',
    });
  }

  // Verify college owns the scholarship this application belongs to
  const scholarship = await Scholarship.findById(application.scholarshipId);

  if (!scholarship || scholarship.collegeId.toString() !== college._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to review this application.',
    });
  }

  // Only pending or under_review can be reviewed
  const reviewableStatuses = ['pending', 'under_review'];
  if (!reviewableStatuses.includes(application.applicationStatus)) {
    return res.status(400).json({
      success: false,
      message: `Cannot review an application with status: ${application.applicationStatus}.`,
    });
  }

  // Update application status and review metadata
  application.applicationStatus  = decision === 'approved' ? 'approved' : 'rejected';
  application.review.reviewedBy   = req.user._id;
  application.review.reviewedAt   = new Date();
  if (rejectionReason)  application.review.rejectionReason = rejectionReason;
  if (internalNotes)    application.review.internalNotes   = internalNotes;
  await application.save();

  // Update scholarship statistics atomically
  const scholarshipUpdate = {
    $inc: { 'statistics.pendingApplications': -1 },
  };

  if (decision === 'approved') {
    scholarshipUpdate.$inc['statistics.approvedApplications'] = 1;
    // Decrement availableSlots — floor at 0
    if (
      scholarship.financialDetails?.availableSlots !== undefined &&
      scholarship.financialDetails.availableSlots > 0
    ) {
      scholarshipUpdate.$inc['financialDetails.availableSlots'] = -1;
    }
  }

  await Scholarship.findByIdAndUpdate(application.scholarshipId, scholarshipUpdate);

  res.json({
    success: true,
    message: `Application ${decision} successfully.`,
    data: {
      applicationId:     application._id,
      applicationStatus: application.applicationStatus,
      reviewedAt:        application.review.reviewedAt,
    },
  });
});