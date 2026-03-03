// Scholarship.js — Scholarship listings posted by colleges

const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    collegeId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'College',
      required: true,
    },
    collegeName: String,   // denormalized for fast listing without populate

    scholarshipTitle: {
      type:     String,
      required: true,
      trim:     true,
    },
    description: String,

    scholarshipType: {
      type:     String,
      enum:     ['merit', 'reservation', 'both'],
      required: true,
    },

    // ── Financial details ──
    financialDetails: {
      amount:         { type: Number, min: 0 },
      totalSlots:     { type: Number, min: 1 },
      availableSlots: { type: Number, min: 0 },
    },

    // ── Eligibility ──
    requirements: {
      eligibilityCriteria:    String,
      requiredDocuments:      [String],
      additionalRequirements: String,
    },

    applicationDeadline: {
      type:     Date,
      required: true,
    },

    // ── Geographic filter (null = open to all locations) ──
    locationFilter: {
      province: {
        provinceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
        provinceName: String,
      },
      district: {
        districtId:   { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
        districtName: String,
      },
      municipality: {
        municipalityId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Municipality' },
        municipalityName: String,
      },
    },

    isActive: { type: Boolean, default: true },

    // ── Application statistics (updated via $inc) ──
    statistics: {
      totalApplications:    { type: Number, default: 0 },
      approvedApplications: { type: Number, default: 0 },
      pendingApplications:  { type: Number, default: 0 },
    },

    // ── Soft delete ──
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
scholarshipSchema.index({ collegeId:                              1 });
scholarshipSchema.index({ scholarshipType:                        1 });
scholarshipSchema.index({ applicationDeadline:                    1 });
scholarshipSchema.index({ isActive:                               1 });
scholarshipSchema.index({ 'locationFilter.province.provinceId':   1 });
scholarshipSchema.index({ scholarshipTitle: 'text', description: 'text' }); // full-text search

// Compound indexes for most common queries
scholarshipSchema.index({ isActive: 1, applicationDeadline: 1 });
scholarshipSchema.index({ collegeId: 1, isActive: 1 });

// ─────────────────────────────────────────
// Virtual — is deadline passed?
// ─────────────────────────────────────────
scholarshipSchema.virtual('isExpired').get(function () {
  return new Date() > this.applicationDeadline;
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);