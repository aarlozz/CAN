import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    // ─── Institution ───────────────────────────────────────────────────────────
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },
    institutionName: { type: String, trim: true }, // Denormalized for fast list reads

    // ─── Core Details ──────────────────────────────────────────────────────────
    scholarshipTitle: {
      type: String,
      required: [true, "Scholarship title is required"],
      trim: true,
    },
    description: { type: String, trim: true },
    termsAndConditions: { type: String, trim: true },

    // ─── Coverage ──────────────────────────────────────────────────────────────
    coverage: {
      scholarshipType2: {
        type: String,
        enum: [
          "full_tuition",
          "partial_tuition",
          "merit_based",
          "need_based",
          "disability",
          "gender",
          "ethnic",
        ],
         //
         // required: [true, "Scholarship type is required"],
      },
      amountNpr: {
        type: Number,
        min: [0, "Amount cannot be negative"],
      },
      percentage: {
        type: Number,
        min: [0, "Percentage cannot be negative"],
        max: [100, "Percentage cannot exceed 100"],
      },
    },

    // ─── Eligibility Criteria ──────────────────────────────────────────────────
    eligibilityCriteria: {
      targetLevel: {
        type: String,
        enum: ["plus_two", "bachelor", "master", "mphil", "phd", "diploma"],
        // required: [true, "Scholarship type is required"],
      },
      targetFaculty: { type: String, trim: true },
      subject: { type: String, trim: true },
      gender: {
        type: String,
        enum: ["male", "female", "other", "any"],
        default: "any",
      },
      isNepali: { type: Boolean, default: true },
      hasDisability: { type: Boolean, default: false },
      additionalRequirements: { type: String, trim: true },
      requiredDocuments: [{ type: String }], // e.g. ["slc_marksheet", "plus2_gradesheet"]
    },

    // ─── Seats ─────────────────────────────────────────────────────────────────
    totalSeats: {
      type: Number,
      min: [1, "Must have at least 1 seat"],
    },
    remainingSeats: {
      type: Number,
      min: [0, "Remaining seats cannot be negative"],
      validate: {
        validator: function (val) {
          return val <= this.totalSeats;
        },
        message: "remainingSeats cannot exceed totalSeats",
      },
    },

    // ─── Location Filter (null = open to all) ──────────────────────────────────
    locationFilter: {
      province: {
        provinceId: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
        provinceName: { type: String, trim: true },
      },
      district: {
        districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
        districtName: { type: String, trim: true },
      },
      municipality: {
        municipalityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Municipality",
        },
        municipalityName: { type: String, trim: true },
      },
    },

    // ─── Deadline & Status ─────────────────────────────────────────────────────
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    isActive: { type: Boolean, default: true },

    // ─── Running Stats ─────────────────────────────────────────────────────────
    statistics: {
      totalApplications: { type: Number, default: 0 },
      approvedApplications: { type: Number, default: 0 },
      pendingApplications: { type: Number, default: 0 },
    },

    // ─── Soft Delete ───────────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
scholarshipSchema.index({ institutionId: 1 });
scholarshipSchema.index({ "coverage.scholarshipType": 1 });
scholarshipSchema.index({ "coverage.amountNpr": 1 });
scholarshipSchema.index({ "eligibilityCriteria.targetLevel": 1 });
scholarshipSchema.index({ "locationFilter.province.provinceId": 1 });
scholarshipSchema.index({ "locationFilter.district.districtId": 1 });
scholarshipSchema.index({ applicationDeadline: 1 });
scholarshipSchema.index({ isActive: 1 });
scholarshipSchema.index({ isActive: 1, applicationDeadline: 1 }); // most common query
scholarshipSchema.index({ institutionId: 1, isActive: 1 }); // institution's active scholarships
scholarshipSchema.index(
  { scholarshipTitle: "text", description: "text" },
  { name: "scholarship_text_search" },
);

// ─── Virtuals ──────────────────────────────────────────────────────────────────
scholarshipSchema.virtual("isExpired").get(function () {
  return new Date() > this.applicationDeadline;
});

export default mongoose.model("Scholarship", scholarshipSchema);
