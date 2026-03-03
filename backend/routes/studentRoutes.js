// studentRoutes.js — Student profile and document endpoints
//
// All routes require: protect + authorize('student')
//
//   GET    /api/student/profile               — own full profile
//   PUT    /api/student/profile               — update own profile
//   GET    /api/student/profile/completion    — section completion breakdown
//   POST   /api/student/documents             — upload a document (multipart/form-data)
//   DELETE /api/student/documents/:docId      — remove a document

const express = require('express');
const { protect, authorize }  = require('../middleware/authMiddleware');
const upload                  = require('../middleware/upload');
const {
  getMyProfile,
  updateMyProfile,
  getCompletion,
  uploadDocument,
  removeDocument,
} = require('../controllers/studentController');

const router = express.Router();

// All student routes require authentication as a student
const studentAuth = [protect, authorize('student')];

// ── Profile routes ─────────────────────────────────────────────────────────
// IMPORTANT: /profile/completion must be defined BEFORE /profile
// to prevent Express matching "completion" as a sub-path collision.
// (Both are GET on /profile* — more specific route first.)
router.get('/profile/completion', ...studentAuth, getCompletion);
router.get('/profile',            ...studentAuth, getMyProfile);
router.put('/profile',            ...studentAuth, updateMyProfile);

// ── Document routes ────────────────────────────────────────────────────────
// upload.single('document') runs AFTER auth checks, BEFORE the controller.
// multer errors (size limit, bad type) are caught by the global errorHandler.
router.post('/documents',         ...studentAuth, upload.single('document'), uploadDocument);
router.delete('/documents/:docId',...studentAuth, removeDocument);

module.exports = router;