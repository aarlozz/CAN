// ScholarshipApplication.js — Student scholarship applications
// Stores a studentSnapshot at apply-time so data is preserved
// even if the student later edits their profile.

const mongoose = require('mongoose');

const applicationDocSchema = new mongoose.Schema({
  documentType: {
    type:     String,
    enum:     ['admit_card', 'gradesheet', 'slc_marksheet', 'plus2_gradesheet',
               'plus2_marksheet', 'certificate', 'caste_certificate',
               'disability_certificate', 'school_certificate', 'other'],
    required: true,
  },
  documentTitle: String,
  filePath:      { type: String, required: true },
  fileName:      String,
  fileSize:      Number,
  mimeType:      String,
  uploadedAt:    { type: Date, default: Date.now },
});

const scholarshipApplicationSchema = new mongoose.Schema(
  {
    scholarshipId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Scholarship',
      required: true,
    },
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },
    applicationType: {
      type:     String,
      enum:     ['merit', 'reservation'],
      required: true,
    },
    applicationStatus: {
      type:    String,
      enum:    ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
      default: 'pending',
    },

    // ── Student snapshot (captured at apply time — immutable) ──
    studentSnapshot: {
      fullName:    String,
      gender:      String,
      dateOfBirth: Date,
      phone:       String,
      email:       String,
      location: {
        province:    String,
        district:    String,
        municipality: String,
        addressLine: String,
      },
      educationInfo: {
        schoolName:            String,
        schoolType:            String,
        currentEducationLevel: String,
      },
      reservationInfo: {
        caste:          String,
        hasDisability:  Boolean,
        disabilityType: String,
      },
      guardianInfo: {
        name:  String,
        phone: String,
      },
      snapshotCreatedAt: { type: Date, default: Date.now },
    },

    // ── Merit-specific details ──
    meritDetails: {
      academicRecords: {
        slcPercentage:   Number,
        slcGpa:          Number,
        plus2Percentage: Number,
        plus2Gpa:        Number,
        entranceScore:   Number,
      },
      achievements:    String,
      extraCurricular: String,
    },

    // ── Reservation-specific details ──
    reservationDetails: {
      reservationCategory: {
        type: String,
        enum: ['government_school', 'community_school', 'caste',
               'disability', 'gender', 'other'],
      },
      schoolType:           String,
      caste:                String,
      disabilityType:       String,
      disabilityPercentage: Number,
      genderCategory:       String,
      supportingDetails:    String,
    },

    // ── Submitted documents ──
    documents: [applicationDocSchema],

    // ── Review info (set by college) ──
    review: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
      reviewedAt:    Date,
      rejectionReason: String,
      internalNotes: String,
    },

    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

// Prevent duplicate applications from same student to same scholarship
scholarshipApplicationSchema.index(
  { scholarshipId: 1, studentId: 1 },
  { unique: true }
);

scholarshipApplicationSchema.index({ studentId:         1 });
scholarshipApplicationSchema.index({ scholarshipId:     1 });
scholarshipApplicationSchema.index({ applicationStatus: 1 });
scholarshipApplicationSchema.index({ applicationType:   1 });
scholarshipApplicationSchema.index({ appliedAt:         -1 });

// Compound indexes for common list queries
scholarshipApplicationSchema.index({ studentId: 1,     applicationStatus: 1 });
scholarshipApplicationSchema.index({ scholarshipId: 1, applicationStatus: 1 });

module.exports = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);