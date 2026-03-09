// authMiddleware.js — JWT verification + role-based authorization
//
// Exports (named):
//   protect              — verifies JWT, attaches full User doc to req.user
//   authorize(...roles)  — factory that returns middleware checking userType

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────
// protect
// Verifies Bearer token, fetches the User document from DB,
// and attaches it to req.user for downstream controllers.
//
// Why fetch from DB (not just trust the token)?
//   — So deactivated accounts are blocked even with a valid token
//   — So req.user always has up-to-date isActive, userType, etc.
// ─────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    // 1. Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Fetch user from DB (password excluded by select: false in schema)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user no longer exists' });
    }

    // 3. Reject deactivated accounts
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    // 4. Attach to request for use in controllers
    req.user = user;
    next();

  } catch (error) {
    // jwt.verify throws on expired or tampered tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired — please log in again' });
    }
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

// ─────────────────────────────────────────────────────────────────
// authorize
// Factory function — returns Express middleware that checks whether
// req.user.userType is in the allowed roles list.
// Must be used AFTER protect() in the middleware chain.
//
// Usage:
//   router.post('/scholarships', protect, authorize('college'), createScholarship);
//   router.get('/admin/users',   protect, authorize('admin', 'provincial_admin'), listUsers);
// ─────────────────────────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        message: `Access denied — required role: [${roles.join(', ')}], your role: ${req.user.userType}`,
      });
    }
//next();
  };
};

module.exports = { protect, authorize };