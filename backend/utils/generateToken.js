// generateToken.js — JWT Token Generator Utility
// Updated: payload now includes { id, userType } so middleware
// can run role checks without an extra DB query on every request.

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generates a signed JWT token
 * @param {string} id       - MongoDB ObjectId of the User document
 * @param {string} userType - Role: 'admin' | 'provincial_admin' | 'college' | 'student'
 * @param {string} expiresIn - Token expiry (default from .env JWT_EXPIRE or '7d')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, userType, expiresIn) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id, userType },                                         // ← userType now in payload
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;