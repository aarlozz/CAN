// District.js — Districts linked to Province

const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema(
  {
    provinceId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Province',
      required: true,
    },
    provinceName: String,   // denormalized for fast reads
    districtName: {
      type:     String,
      required: true,
      trim:     true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
districtSchema.index({ provinceId:   1 });
districtSchema.index({ districtName: 1 });

module.exports = mongoose.model('District', districtSchema);