// Student.js — Student profile
// Linked to User via userId. Documents uploaded separately via multer.

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentType: {
    type:     String,
    enum:     ['admit_card', 'gradesheet', 'slc_marksheet', 'plus2_gradesheet',
               'plus2_marksheet', 'certificate', 'other'],
    required: true,
  },
  documentTitle: { type: String, required: true },
  filePath:      { type: String, required: true },
  fileName:      String,
  fileSize:      Number,
  mimeType:      String,
  uploadedAt:    { type: Date, default: Date.now },
});

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },

    // ── Personal info ──
    personalInfo: {
      fullName: {
        type:     String,
        required: true,
        trim:     true,
      },
      gender: {
        type:     String,
        enum:     ['Male', 'Female', 'Other', 'Prefer not to say'],
        required: true,
      },
      dateOfBirth: Date,
      phone:       String,
    },

    // ── Location ──
    location: {
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
      addressLine: String,
    },

    // ── Guardian info ──
    guardianInfo: {
      name:     String,
      phone:    String,
      relation: String,
    },

    // ── Education ──
    educationInfo: {
      schoolName: String,
      schoolType: {
        type: String,
        enum: ['Government', 'Community', 'Private', 'Other'],
      },
      currentEducationLevel: String,
    },

    // ── Reservation / quota info ──
    reservationInfo: {
      caste:         String,
      hasDisability: { type: Boolean, default: false },
      disabilityType: String,
    },

    // ── Uploaded documents ──
    documents: [documentSchema],

    // ── Profile completion flag ──
    profileCompleted: { type: Boolean, default: false },

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
studentSchema.index({ userId:                         1 });
studentSchema.index({ 'location.province.provinceId': 1 });
studentSchema.index({ 'location.district.districtId': 1 });
studentSchema.index({ 'educationInfo.schoolType':      1 });
studentSchema.index({ 'personalInfo.fullName':        'text' }); // full-text search

module.exports = mongoose.model('Student', studentSchema);