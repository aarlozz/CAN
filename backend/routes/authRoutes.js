// authRoutes.js — Authentication endpoints
//
//   POST /api/auth/register/student  — new student account
//   POST /api/auth/register/college  — new college account (starts pending)
//   POST /api/auth/login             — all roles
//   POST /api/auth/logout            — protected, clears refresh tokens

const express = require('express');
const {
  registerStudent,
  registerCollege,
  login,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────
router.post('/register/student', registerStudent);
router.post('/register/college', registerCollege);
router.post('/login',            login);

// ── Protected routes ──────────────────────────────────────────────
router.post('/logout', protect, logout);

module.exports = router;