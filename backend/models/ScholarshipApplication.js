import mongoose from "mongoose";

const scholarshipApplicationSchema = new mongoose.Schema(
  {
    // ── Core references 
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    // ── Application type 
    applicationType: {
      type: String,
      enum: ["merit", "reservation"],
      required: true,
    },

    // ── Status lifecycle 
    applicationStatus: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "withdrawn"],
      default: "pending",
    },

    // ── Student snapshot (frozen at application time)
    // Preserves student data even if they update their profile later
    studentSnapshot: {
      fullName:    String,
      gender:      String,
      dateOfBirth: Date,
      phone:       String,
      email:       String,
      location: {
        province:     String,
        district:     String,
        municipality: String,
        addressLine:  String,
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
        name:        String,
        phone:       String,
        relation:    String,
      },
      snapshotCreatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // ── Merit-based details (filled when applicationType === "merit") ──────────
    meritDetails: {
      academicRecords: {
        slcPercentage:  Number,
        slcGpa:         Number,
        plus2Percentage:Number,
        plus2Gpa:       Number,
        entranceScore:  Number,
      },
      achievements:     String,
      extraCurricular:  String,
    },

    // ── Reservation-based details (filled when applicationType === "reservation")
    reservationDetails: {
      reservationCategory: {
        type: String,
        enum: [
          "government_school",
          "community_school",
          "caste",
          "disability",
          "gender",
          "other",
        ],
      },
      schoolType:          String,
      caste:               String,
      disabilityType:      String,
      disabilityPercentage:Number,
      genderCategory:      String,
      supportingDetails:   String,
    },

    // ── Application documents (embedded) ──────────────────────────────────────
    documents: [
      {
        documentType: {
          type: String,
          enum: [
            "admit_card",
            "gradesheet",
            "slc_marksheet",
            "plus2_gradesheet",
            "plus2_marksheet",
            "certificate",
            "caste_certificate",
            "disability_certificate",
            "school_certificate",
            "other",
          ],
          required: true,
        },
        documentTitle: String,
        filePath:      { type: String, required: true },
        fileName:      String,
        fileSize:      Number,
        mimeType:      String,
        uploadedAt:    { type: Date, default: Date.now },
      },
    ],

    // ── Review (filled by institution when they act on the application) ────────
    review: {
      reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt:      Date,
      rejectionReason: String,
      internalNotes:   String,
    },

    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Prevent a student applying twice to the same scholarship
scholarshipApplicationSchema.index(
  { scholarshipId: 1, studentId: 1 },
  { unique: true }
);
scholarshipApplicationSchema.index({ studentId: 1 });
scholarshipApplicationSchema.index({ scholarshipId: 1 });
scholarshipApplicationSchema.index({ applicationStatus: 1 });
scholarshipApplicationSchema.index({ applicationType: 1 });
scholarshipApplicationSchema.index({ appliedAt: -1 });
// Compound — most common dashboard queries
scholarshipApplicationSchema.index({ studentId: 1, applicationStatus: 1 });
scholarshipApplicationSchema.index({ scholarshipId: 1, applicationStatus: 1 });

export default mongoose.model(
  "ScholarshipApplication",
  scholarshipApplicationSchema
);