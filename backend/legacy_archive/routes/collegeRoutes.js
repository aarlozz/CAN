// collegeRoutes.js — College profile endpoints
//
// Protected (college role):
//   GET    /api/college/profile              — own full profile
//   PUT    /api/college/profile              — update own profile
//   GET    /api/college/verification         — verification status
//   POST   /api/college/courses              — add a course
//   DELETE /api/college/courses/:courseId    — remove a course
//
// Public (no auth):
//   GET    /api/college/list                 — all verified colleges (paginated)
//   GET    /api/college/:id                  — single verified college

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMyProfile,
  updateMyProfile,
  getVerification,
  addCourse,
  removeCourse,
  listColleges,
  getCollegeById,
} = require('../controllers/collegeController');

const router = express.Router();

// ── IMPORTANT: All specific named routes MUST be defined BEFORE /:id ──────────
// Express matches routes in order. If /:id comes first, requests to
// /profile, /verification, /list, /courses will be caught with those
// words treated as the :id param — causing ObjectId cast errors or wrong handlers.

// ── Public named route ─────────────────────────────────────────────────────────
router.get('/list', listColleges);

// ── Protected named routes (college role only) ─────────────────────────────────
router.get('/profile',               protect, authorize('college'), getMyProfile);
router.put('/profile',               protect, authorize('college'), updateMyProfile);
router.get('/verification',          protect, authorize('college'), getVerification);
router.post('/courses',              protect, authorize('college'), addCourse);
router.delete('/courses/:courseId',  protect, authorize('college'), removeCourse);

// ── Public wildcard — MUST be last ────────────────────────────────────────────
router.get('/:id', getCollegeById);

module.exports = router;