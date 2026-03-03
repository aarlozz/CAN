// studentController.js — Student profile management + document upload
//
//   getMyProfile     GET    /api/student/profile
//   updateMyProfile  PUT    /api/student/profile
//   getCompletion    GET    /api/student/profile/completion
//   uploadDocument   POST   /api/student/documents
//   removeDocument   DELETE /api/student/documents/:docId

const fs           = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const Student      = require('../models/Student');

// Fields a student cannot self-update —
// documents are managed via dedicated upload/remove endpoints
const BLOCKED_UPDATE_FIELDS = [
  'userId', 'documents', 'profileCompleted', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt',
];

// Sections required for profileCompleted = true
// Used by both getCompletion and _checkCompletion helper
const COMPLETION_SECTIONS = [
  {
    key:    'personalInfo',
    label:  'Personal Information',
    check:  (s) => !!(s.personalInfo?.fullName && s.personalInfo?.gender && s.personalInfo?.dateOfBirth && s.personalInfo?.phone),
  },
  {
    key:    'location',
    label:  'Location',
    check:  (s) => !!(s.location?.province?.provinceId && s.location?.district?.districtId),
  },
  {
    key:    'guardianInfo',
    label:  'Guardian Information',
    check:  (s) => !!(s.guardianInfo?.name && s.guardianInfo?.phone && s.guardianInfo?.relation),
  },
  {
    key:    'educationInfo',
    label:  'Education Information',
    check:  (s) => !!(s.educationInfo?.schoolName && s.educationInfo?.schoolType && s.educationInfo?.currentEducationLevel),
  },
  {
    key:    'reservationInfo',
    label:  'Reservation Information',
    check:  (s) => s.reservationInfo?.caste !== undefined && s.reservationInfo?.caste !== null,
  },
  {
    key:    'documents',
    label:  'Documents',
    check:  (s) => s.documents?.length > 0,
  },
];

// ─────────────────────────────────────────────────────────────────
// Helper — recalculates profileCompleted based on filled sections
// Returns true only when all COMPLETION_SECTIONS pass
// ─────────────────────────────────────────────────────────────────
const _isProfileComplete = (student) =>
  COMPLETION_SECTIONS.every((section) => section.check(student));

// ─────────────────────────────────────────────────────────────────
// GET /api/student/profile
// Returns the full profile of the logged-in student
// ─────────────────────────────────────────────────────────────────
exports.getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found. Please contact support.',
    });
  }

  res.json({ success: true, data: student });
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/student/profile
// Partial update of allowed profile fields.
// Strips blocked fields, updates, then recalculates profileCompleted.
// ─────────────────────────────────────────────────────────────────
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  BLOCKED_UPDATE_FIELDS.forEach((field) => delete body[field]);

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No updatable fields provided.',
    });
  }

  // Apply update first, then recalculate completion
  let student = await Student.findOneAndUpdate(
    { userId: req.user._id },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.',
    });
  }

  // Recalculate and persist profileCompleted flag
  const completed = _isProfileComplete(student);
  if (student.profileCompleted !== completed) {
    student = await Student.findByIdAndUpdate(
      student._id,
      { profileCompleted: completed },
      { new: true }
    );
  }

  res.json({ success: true, data: student });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/student/profile/completion
// Returns section-by-section completion breakdown + overall %
// Useful for dashboard progress bars
// ─────────────────────────────────────────────────────────────────
exports.getCompletion = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.',
    });
  }

  const sections = COMPLETION_SECTIONS.map((section) => ({
    key:       section.key,
    label:     section.label,
    completed: section.check(student),
  }));

  const completedCount = sections.filter((s) => s.completed).length;
  const percentage     = Math.round((completedCount / sections.length) * 100);

  res.json({
    success: true,
    data: {
      percentage,
      completedCount,
      totalSections: sections.length,
      isComplete:    student.profileCompleted,
      sections,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// POST /api/student/documents
// Uploads a document via multer (upload.single('document') runs first).
// Body fields (form-data): documentType, documentTitle, + file
// ─────────────────────────────────────────────────────────────────
exports.uploadDocument = asyncHandler(async (req, res) => {
  // multer adds req.file if a file was received
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Include a file in the "document" field.',
    });
  }

  const { documentType, documentTitle } = req.body;

  if (!documentType || !documentTitle) {
    // Clean up the uploaded file if validation fails
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({
      success: false,
      message: 'documentType and documentTitle are required.',
    });
  }

  const validTypes = [
    'admit_card', 'gradesheet', 'slc_marksheet', 'plus2_gradesheet',
    'plus2_marksheet', 'certificate', 'other',
  ];
  if (!validTypes.includes(documentType)) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({
      success: false,
      message: `documentType must be one of: ${validTypes.join(', ')}.`,
    });
  }

  // Push new document entry to the documents array
  let student = await Student.findOneAndUpdate(
    { userId: req.user._id },
    {
      $push: {
        documents: {
          documentType,
          documentTitle,
          filePath:  req.file.path,
          fileName:  req.file.filename,
          fileSize:  req.file.size,
          mimeType:  req.file.mimetype,
        },
      },
    },
    { new: true, runValidators: true }
  );

  if (!student) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.',
    });
  }

  // Recalculate profileCompleted — first document may complete this section
  const completed = _isProfileComplete(student);
  if (student.profileCompleted !== completed) {
    student = await Student.findByIdAndUpdate(
      student._id,
      { profileCompleted: completed },
      { new: true }
    );
  }

  // Return just the newly added document (last in array)
  const newDoc = student.documents[student.documents.length - 1];

  res.status(201).json({
    success:          true,
    message:          'Document uploaded successfully.',
    data:             newDoc,
    totalDocuments:   student.documents.length,
    profileCompleted: student.profileCompleted,
  });
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/student/documents/:docId
// Removes document entry from DB array AND deletes file from disk
// ─────────────────────────────────────────────────────────────────
exports.removeDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;

  // Find first so we can get the filePath before removing
  const studentBefore = await Student.findOne(
    { userId: req.user._id },
    { documents: { $elemMatch: { _id: docId } } }
  );

  if (!studentBefore) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.',
    });
  }

  const docToDelete = studentBefore.documents[0];
  if (!docToDelete) {
    return res.status(404).json({
      success: false,
      message: 'Document not found.',
    });
  }

  // Remove from DB array
  const student = await Student.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { documents: { _id: docId } } },
    { new: true }
  );

  // Delete physical file — non-blocking, silent on error
  fs.unlink(docToDelete.filePath, (err) => {
    if (err) console.warn(`⚠️  Could not delete file: ${docToDelete.filePath}`, err.message);
  });

  // Recalculate profileCompleted — removing last doc may de-complete this section
  const completed = _isProfileComplete(student);
  if (student.profileCompleted !== completed) {
    await Student.findByIdAndUpdate(student._id, { profileCompleted: completed });
  }

  res.json({
    success:          true,
    message:          'Document removed successfully.',
    totalDocuments:   student.documents.length,
    profileCompleted: completed,
  });
});