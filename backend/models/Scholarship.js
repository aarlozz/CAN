import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    // Owner institution 
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },
    institutionName: { type: String, trim: true }, // Denormalized for fast list reads

    // Core details
    scholarshipTitle: {
      type: String,
      required: [true, "Scholarship title is required"],
      trim: true,
    },
    description: { type: String, trim: true },

    scholarshipType: {
      type: String,
      enum: ["merit", "reservation", "both"],
      required: [true, "Scholarship type is required"],
    },

    // Financial details 
    financialDetails: {
      amount: {
        type: Number,
        min: [0, "Amount cannot be negative"],
      },
      totalSlots: {
        type: Number,
        min: [1, "Must have at least 1 slot"],
      },
      availableSlots: {
        type: Number,
        min: [0, "Available slots cannot be negative"],
      },
    },

    // Requirements
    requirements: {
      eligibilityCriteria: { type: String, trim: true },
      requiredDocuments:   [{ type: String }], // e.g. ["slc_marksheet", "plus2_gradesheet"]
      additionalRequirements: { type: String, trim: true },
    },

    // Deadline
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    // Location filter (null = open to all)
    locationFilter: {
      province: {
        provinceId:   { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
        provinceName: { type: String },
      },
      district: {
        districtId:   { type: mongoose.Schema.Types.ObjectId, ref: "District" },
        districtName: { type: String },
      },
      municipality: {
        municipalityId:   { type: mongoose.Schema.Types.ObjectId, ref: "Municipality" },
        municipalityName: { type: String },
      },
    },

    // Status 
    isActive: { type: Boolean, default: true },

    // Running stats (incremented on application actions) 
    statistics: {
      totalApplications:   { type: Number, default: 0 },
      approvedApplications:{ type: Number, default: 0 },
      pendingApplications: { type: Number, default: 0 },
    },

    // Soft delete
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes 
scholarshipSchema.index({ institutionId: 1 });
scholarshipSchema.index({ scholarshipType: 1 });
scholarshipSchema.index({ applicationDeadline: 1 });
scholarshipSchema.index({ isActive: 1 });
scholarshipSchema.index({ "locationFilter.province.provinceId": 1 });
scholarshipSchema.index({ isActive: 1, applicationDeadline: 1 }); // compound — most common query
scholarshipSchema.index({ institutionId: 1, isActive: 1 });       // compound — institution's active scholarships
scholarshipSchema.index(
  { scholarshipTitle: "text", description: "text" },
  { name: "scholarship_text_search" }
);

//  is the deadline already past? 
scholarshipSchema.virtual("isExpired").get(function () {
  return new Date() > this.applicationDeadline;
});

export default mongoose.model("Scholarship", scholarshipSchema);
