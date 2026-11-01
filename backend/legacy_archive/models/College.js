// College.js — College/Institution profile (replaces the old single-collection model)
// Linked to User via userId. Verification managed by ProvincialAdmin.

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type:     String,
    required: true,
    trim:     true,
  },
  courseLevel: {
    type:     String,
    enum:     ['Undergraduate', 'Graduate', 'Postgraduate', 'Diploma', 'Certificate'],
    required: true,
  },
  duration:    String,
  description: String,
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

const collegeSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },
    collegeName: {
      type:     String,
      required: true,
      trim:     true,
    },

    // ── Location (structured refs + denormalized names) ──
    location: {
      province: {
        provinceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
        provinceName: String,
      },
      district: {
        districtId:   { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
        districtName: String,
      },
      municipality: {
        municipalityId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Municipality' },
        municipalityName: String,
      },
      addressLine: String,
    },

    // ── Contact ──
    contactInfo: {
      websiteUrl: { type: String, trim: true },
      email:      { type: String, lowercase: true, trim: true },
      phone:      { type: String, trim: true },
    },

    // ── About ──
    about: {
      description:         String,
      history:             [String],
      affiliatedUniversity: String,
    },

    // ── Courses (embedded sub-documents) ──
    courses: [courseSchema],

    // ── Verification status (set by ProvincialAdmin) ──
    verification: {
      status: {
        type:    String,
        enum:    ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'ProvincialAdmin',
      },
      verifiedAt:      Date,
      rejectionReason: String,
    },

    // ── Soft delete ──
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
collegeSchema.index({ userId:                          1 });
collegeSchema.index({ 'verification.status':           1 });
collegeSchema.index({ 'location.province.provinceId':  1 });
collegeSchema.index({ 'location.district.districtId':  1 });
collegeSchema.index({ collegeName: 'text', 'about.description': 'text' }); // full-text search

// ─────────────────────────────────────────
// Virtual — total course count
// ─────────────────────────────────────────
collegeSchema.virtual('totalCourses').get(function () {
  return this.courses.length;
});

module.exports = mongoose.model('College', collegeSchema);