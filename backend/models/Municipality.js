// Municipality.js — Municipalities linked to District

const mongoose = require('mongoose');

const municipalitySchema = new mongoose.Schema(
  {
    districtId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'District',
      required: true,
    },
    districtName:     String,   // denormalized for fast reads
    municipalityName: {
      type:     String,
      required: true,
      trim:     true,
    },
    municipalityType: {
      type:     String,
      enum:     ['Metropolitan', 'Sub-Metropolitan', 'Municipality', 'Rural Municipality'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
municipalitySchema.index({ districtId:       1 });
municipalitySchema.index({ municipalityName: 1 });

module.exports = mongoose.model('Municipality', municipalitySchema);