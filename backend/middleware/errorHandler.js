// errorHandler.js — Global Express error handler
//
// Must be mounted LAST in app.js:
//   app.use(errorHandler);
//
// Catches any error passed to next(err) from:
//   — asyncHandler (thrown errors from controllers)
//   — Express itself (body-parser errors, etc.)
//   — Mongoose validation / cast / duplicate key errors
//
// Returns consistent JSON shape:
//   { success: false, message: "...", errors: [...] (optional) }

const errorHandler = (err, req, res, next) => {   // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors     = undefined;

  // ── Mongoose: bad ObjectId ─────────────────────────────────────
  // e.g. GET /api/scholarships/not-a-valid-id
  if (err.name === 'CastError') {
    statusCode = 404;
    message    = `Resource not found — invalid id: ${err.value}`;
  }

  // ── Mongoose: duplicate key (unique index violation) ───────────
  // e.g. registering with an email that already exists
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = Object.values(err.keyValue || {})[0] || '';
    message    = `${field} '${value}' is already registered`;
  }

  // ── Mongoose: validation errors ───────────────────────────────
  // e.g. required field missing, enum value invalid
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors     = Object.values(err.errors).map((e) => e.message);
    message    = errors.join(', ');
  }

  // ── JWT: expired token ─────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token has expired — please log in again';
  }

  // ── JWT: malformed / invalid signature ────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token — please log in again';
  }

  // ── Multer: file too large ─────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message    = 'File is too large — maximum size is 5MB';
  }

  // ── Multer: unexpected field ───────────────────────────────────
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message    = 'Unexpected file field in upload';
  }

  // ── Log server errors in development ──────────────────────────
  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    console.error('❌ Server Error:', err.stack || err);
  }

  const response = { success: false, message };
  if (errors) response.errors = errors;

  res.status(statusCode).json(response);
};

module.exports = errorHandler;