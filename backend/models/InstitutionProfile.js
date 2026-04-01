import mongoose from "mongoose";

const courseSubSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    courseLevel: {
      type: String,
      enum: ["Undergraduate", "Graduate", "Postgraduate", "Diploma", "Certificate"],
      required: [true, "Course level is required"],
    },
    duration: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const institutionSchema = new mongoose.Schema(
  {
    // Auth link
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic info
    institutionName: {
      type: String,
      required: true,
      trim: true,
    },
    institutionType: {
      type: String,
      required: true,
      enum: ["School", "College", "University"],
    },
    establishedYear: { type: Number },

    // Location
    location: {
      province:     { type: String },
      district:     { type: String },
      municipality: { type: String },
      ward:         { type: String },
      street:       { type: String },

      provinceRef: {
        provinceId:   { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
        provinceName: { type: String },
      },
      districtRef: {
        districtId:   { type: mongoose.Schema.Types.ObjectId, ref: "District" },
        districtName: { type: String },
      },
      municipalityRef: {
        municipalityId:   { type: mongoose.Schema.Types.ObjectId, ref: "Municipality" },
        municipalityName: { type: String },
      },
    },

    // Contact
    website: { type: String },
    description: { type: String },

    contactPerson: {
      name:        String,
      phone:       String,
      email:       String,
      designation: String,
    },

    // Courses
    courses: [courseSubSchema],

    // Verification workflow
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "verified",
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: { type: Date },
      rejectionReason: { type: String },
    },

    // Legacy approval flag
    isApproved: {
      type: Boolean,
      default: true,
    },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
institutionSchema.index({ "location.province": 1 });
institutionSchema.index({ "location.district": 1 });
institutionSchema.index({ institutionName: 1 });
institutionSchema.index({ "verification.status": 1 });
institutionSchema.index({ "location.provinceRef.provinceId": 1 });
institutionSchema.index({ "location.districtRef.districtId": 1 });


institutionSchema.virtual("totalCourses").get(function () {
  return (this.courses || []).length;
});

// Middleware: keep isApproved in sync with verification.status
institutionSchema.pre("save", async function () {
  this.isApproved = this.verification?.status === "verified";
});

export default mongoose.model("InstitutionProfile", institutionSchema);