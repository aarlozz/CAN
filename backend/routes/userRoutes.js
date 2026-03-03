// userRoutes.js — Placeholder protected profile route
// Will be replaced by dedicated college/student route files in Steps 5 & 6.

const express           = require('express');
const router            = express.Router();
const { protect }       = require('../middleware/authMiddleware');  // ✅ named import (was default)

// GET /api/institutional/profile
// Returns the authenticated user's basic info.
// Placeholder until collegeController.getProfile is wired up in Step 5.
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    user: {
      id:       req.user._id,
      email:    req.user.email,
      userType: req.user.userType,
    },
  });
});

module.exports = router;