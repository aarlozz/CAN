// adminRoutes.js — Admin and ProvincialAdmin endpoints
//
// Shared (admin + provincial_admin):
//   GET  /api/admin/colleges/pending       — colleges awaiting verification
//   PUT  /api/admin/colleges/:id/verify    — verify a college
//   PUT  /api/admin/colleges/:id/reject    — reject a college
//   GET  /api/admin/stats                  — platform statistics
//
// Admin only:
//   GET  /api/admin/users                  — list all users
//   PUT  /api/admin/users/:id/deactivate   — deactivate a user account

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPendingColleges,
  verifyCollege,
  rejectCollege,
  listUsers,
  deactivateUser,
  getStats,
} = require('../controllers/adminController');

const router = express.Router();

const sharedAuth = [protect, authorize('admin', 'provincial_admin')];
const adminOnly  = [protect, authorize('admin')];

// ── Shared routes (admin + provincial_admin) ───────────────────────────────
// IMPORTANT: /colleges/pending must be before /colleges/:id
// to avoid Express treating "pending" as an :id param
router.get('/colleges/pending',       ...sharedAuth, getPendingColleges);
router.put('/colleges/:id/verify',    ...sharedAuth, verifyCollege);
router.put('/colleges/:id/reject',    ...sharedAuth, rejectCollege);
router.get('/stats',                  ...sharedAuth, getStats);

// ── Admin-only routes ──────────────────────────────────────────────────────
router.get('/users',                  ...adminOnly,  listUsers);
router.put('/users/:id/deactivate',   ...adminOnly,  deactivateUser);

module.exports = router;