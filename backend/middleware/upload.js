// upload.js — Multer file upload middleware
//
// Saves files to: uploads/students/{userId}/{fieldname}/{timestamp}_{originalname}
// Allowed types: PDF, JPEG, PNG
// Max size: 5MB per file
//
// Usage in routes:
//   const upload = require('../middleware/upload');
//   router.post('/documents', protect, authorize('student'), upload.single('document'), uploadDocument);
//
// After multer runs, req.file is available in the controller:
//   req.file.path      — full path on disk
//   req.file.filename  — just the filename
//   req.file.size      — bytes
//   req.file.mimetype  — e.g. 'application/pdf'

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ─────────────────────────────────────────────────────────────────
// Storage — saves to uploads/students/{userId}/{fieldname}/
// ─────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.user is attached by protect() middleware before multer runs
    const uploadPath = path.join(
      'uploads',
      'students',
      req.user._id.toString(),
      file.fieldname               // 'document' — keeps uploads organised by field
    );

    // Create directory tree if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    // Sanitise originalname — replace spaces/special chars with underscore
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${Date.now()}_${safeName}`;
    cb(null, uniqueName);
  },
});

// ─────────────────────────────────────────────────────────────────
// File type filter — PDF, JPEG, PNG only
// ─────────────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass error to multer — errorHandler.js catches LIMIT_UNEXPECTED_FILE
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
  }
};

// ─────────────────────────────────────────────────────────────────
// Multer instance
// ─────────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5MB — errorHandler catches LIMIT_FILE_SIZE
  },
});

module.exports = upload;