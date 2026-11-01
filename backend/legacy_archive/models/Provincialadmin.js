// ProvincialAdmin.js — Provincial admin profile (linked to User via userId)

const mongoose = require('mongoose');

const provincialAdminSchema = new mongoose.Schema(
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
    username: {
      type:      String,
      required:  true,
      unique:    true,
      trim:      true,
      lowercase: true,
    },
    province: {
      provinceId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'Province',
        required: true,
      },
      provinceName: String,   // denormalized for fast reads
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
provincialAdminSchema.index({ userId:               1 });
provincialAdminSchema.index({ username:              1 });
provincialAdminSchema.index({ 'province.provinceId': 1 });

module.exports = mongoose.model('ProvincialAdmin', provincialAdminSchema);