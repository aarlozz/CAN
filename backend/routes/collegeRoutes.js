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

// ── Public routes — no auth needed ────────────────────────────────
// IMPORTANT: /list must be defined BEFORE /:id
// otherwise Express matches "list" as an :id param
router.get('/list', listColleges);
router.get('/:id',  getCollegeById);

// ── Protected routes — college role only ──────────────────────────
router.get('/profile',               protect, authorize('college'), getMyProfile);
router.put('/profile',               protect, authorize('college'), updateMyProfile);
router.get('/verification',          protect, authorize('college'), getVerification);
router.post('/courses',              protect, authorize('college'), addCourse);
router.delete('/courses/:courseId',  protect, authorize('college'), removeCourse);

module.exports = router;