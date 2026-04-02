import mongoose from "mongoose";

// Embedded document sub-schema (documents always queried with the student)
const documentSubSchema = new mongoose.Schema(
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
    documentTitle: { type: String, trim: true },
    filePath:      { type: String, required: true },
    fileName:      { type: String },
    fileSize:      { type: Number },  // bytes
    mimeType:      { type: String },
    uploadedAt:    { type: Date, default: Date.now },
  }
);

const studentSchema = new mongoose.Schema(
  {
    // ── Auth link ──────────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Personal info (upgraded from flat personal_info) ──────────────────────
    personal_info: {
      // Old flat fields — kept for backward compat
      dob:    { type: Date },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      phone:  { type: String, maxlength: 10 },
    },

    
    address: {
      
      province:     { type: String, required: true },
      district:     { type: String, required: true },
      municipality: { type: String, required: true },
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

    
    guardian_info: {
      name:         { type: String, required: true },
      relation:     { type: String, required: true },
      phone_number: { type: String, required: true, maxlength: 10 },
      occupation:   { type: String },
    },

    
    educationInfo: {
      schoolName: { type: String, trim: true },
      schoolType: {
        type: String,
        enum: ["Government", "Community", "Private", "Other"],
      },
      currentEducationLevel: {
        type: String,
        enum: ["SEE", "+2", "Bachelors", "Masters", "Other"],
      },
    },

    
    reservationInfo: {
      caste:         { type: String, trim: true },
      hasDisability: { type: Boolean, default: false },
      disabilityType:{ type: String, trim: true },
    },

    // ── Embedded documents array (new) ────────────────────────────────────────
    documents: [documentSubSchema],

    // ── Profile completion flag (new) ─────────────────────────────────────────
    profileCompleted: { type: Boolean, default: false },

    // ── Soft delete (new) ─────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
studentSchema.index({ user: 1 });
studentSchema.index({ "address.province": 1 });
studentSchema.index({ "address.district": 1 });
studentSchema.index({ "address.provinceRef.provinceId": 1 });
studentSchema.index({ "address.districtRef.districtId": 1 });
studentSchema.index({ "educationInfo.schoolType": 1 });

export default mongoose.model("StudentProfile", studentSchema);