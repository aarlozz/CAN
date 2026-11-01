// Admin.js — Admin profile (linked to User via userId)

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },
    fullName: {
      type:     String,
      required: true,
      trim:     true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
adminSchema.index({ userId: 1 });

module.exports = mongoose.model('Admin', adminSchema);