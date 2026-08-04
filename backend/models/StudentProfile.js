import mongoose from "mongoose";

// ─── Embedded document sub-schema ───────────────────────────────────────────
// CHANGED: files now live in MongoDB via GridFS (see config/gridfs.js), so we
// store a GridFS fileId reference instead of a local filePath.
const documentSubSchema = new mongoose.Schema(
  {
    documentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentType",
      required: true,
    },
    documentTypeKey: { type: String, required: true }, // denormalized for fast lookup, matches DocumentType.key

    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file _id (studentDocuments bucket)
    fileName: { type: String },
    fileSize: { type: Number }, // bytes
    mimeType: { type: String },

    status: {
      type: String,
      enum: ["uploaded", "verified", "rejected"],
      default: "uploaded",
    },
    rejectionReason: { type: String, trim: true },

    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const studentSchema = new mongoose.Schema(
  {
    // ── Auth link ──────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Personal info ────────────────────────────────────────────────────
    personal_info: {
      dob: { type: Date },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      phone: { type: String, maxlength: 10 },
    },

    address: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      municipality: { type: String, required: true },
      ward: { type: String },
      street: { type: String },

      provinceRef: {
        provinceId: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
        provinceName: { type: String },
      },
      districtRef: {
        districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
        districtName: { type: String },
      },
      municipalityRef: {
        municipalityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Municipality",
        },
        municipalityName: { type: String },
      },
    },

    guardian_info: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone_number: { type: String, required: true, maxlength: 10 },
      occupation: { type: String },
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
      caste: { type: String, trim: true },
      hasDisability: { type: Boolean, default: false },
      disabilityType: { type: String, trim: true },
    },

    // ── NEW: drives the document requirements engine ───────────────────────
    currentLevel: {
      type: String,
      enum: ["+2", "Bachelor", "Master", "PhD"],
    },
    selectedCategories: [{ type: String, trim: true, lowercase: true }],
    // e.g. ["need_based", "disability"] — matches ScholarshipCategory.key

    // ── Embedded documents array ────────────────────────────────────────────
    documents: [documentSubSchema],

    // ── Profile completion flag ─────────────────────────────────────────────
    profileCompleted: { type: Boolean, default: false },

    // ── Soft delete ───────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────
studentSchema.index({ user: 1 });
studentSchema.index({ "address.province": 1 });
studentSchema.index({ "address.district": 1 });
studentSchema.index({ "address.provinceRef.provinceId": 1 });
studentSchema.index({ "address.districtRef.districtId": 1 });
studentSchema.index({ "educationInfo.schoolType": 1 });
studentSchema.index({ currentLevel: 1 });
studentSchema.index({ "documents.documentTypeKey": 1 });

export default mongoose.model("StudentProfile", studentSchema);