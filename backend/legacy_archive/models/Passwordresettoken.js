// PasswordResetToken.js — Password reset tokens
// TTL index auto-deletes expired tokens (no manual cleanup needed)

const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    token: {
      type:     String,
      required: true,
      unique:   true,
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
    usedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
passwordResetTokenSchema.index({ token:  1 });
passwordResetTokenSchema.index({ userId: 1 });

// TTL — MongoDB auto-deletes documents when expiresAt is reached
passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);