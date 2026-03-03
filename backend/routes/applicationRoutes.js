// applicationRoutes.js — Scholarship application endpoints
//
// Student routes:
//   POST   /api/applications                          — submit application
//   GET    /api/applications/my                       — own applications (paginated)
//   DELETE /api/applications/:id                      — withdraw (pending only)
//
// College routes:
//   GET    /api/applications/scholarship/:scholarshipId — all apps for a scholarship
//   PUT    /api/applications/:id/review               — approve / reject

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  submitApplication,
  getMyApplications,
  withdrawApplication,
  getApplicationsForScholarship,
  reviewApplication,
} = require('../controllers/applicationController');

const router = express.Router();

const studentAuth = [protect, authorize('student')];
const collegeAuth = [protect, authorize('college')];

// ── Student routes ─────────────────────────────────────────────────────────
// IMPORTANT: /my must be defined BEFORE /:id to avoid Express matching
// "my" as an ObjectId param and throwing a CastError
router.post('/',    ...studentAuth, submitApplication);
router.get('/my',   ...studentAuth, getMyApplications);
router.delete('/:id', ...studentAuth, withdrawApplication);

// ── College routes ─────────────────────────────────────────────────────────
// /scholarship/:scholarshipId — specific prefix avoids clash with /:id
// /:id/review — specific suffix avoids clash with DELETE /:id
router.get('/scholarship/:scholarshipId', ...collegeAuth, getApplicationsForScholarship);
router.put('/:id/review',                 ...collegeAuth, reviewApplication);

module.exports = router;