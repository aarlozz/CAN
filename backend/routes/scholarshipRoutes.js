// scholarshipRoutes.js — Scholarship endpoints
//
// Public (no auth):
//   GET    /api/scholarships          — list active scholarships (paginated + filtered)
//   GET    /api/scholarships/:id      — single scholarship
//
// Protected (college role):
//   GET    /api/scholarships/my       — own scholarships (all statuses)
//   POST   /api/scholarships          — create scholarship
//   PUT    /api/scholarships/:id      — edit own scholarship
//   DELETE /api/scholarships/:id      — soft-delete own scholarship

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  listScholarships,
  getMyScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} = require('../controllers/scholarshipController');

const router = express.Router();

const collegeAuth = [protect, authorize('college')];

// ── Public routes ──────────────────────────────────────────────────────────
// IMPORTANT: /my must be defined BEFORE /:id
// otherwise Express treats "my" as an ObjectId param and crashes with CastError
router.get('/',    listScholarships);
router.get('/my',  ...collegeAuth, getMyScholarships);
router.get('/:id', getScholarshipById);

// ── Protected routes (college only) ───────────────────────────────────────
router.post('/',     ...collegeAuth, createScholarship);
router.put('/:id',   ...collegeAuth, updateScholarship);
router.delete('/:id',...collegeAuth, deleteScholarship);

module.exports = router;