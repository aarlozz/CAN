import mongoose from "mongoose";

/**
 * ScholarshipCategory = a special/reservation category a student can select
 * (e.g. "Need-Based", "Disability", "Remote Area"). Selecting one or more
 * of these unlocks the extra DocumentTypes tagged with the matching key
 * in DocumentType.applicableCategories.
 */
const scholarshipCategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    }, // e.g. "need_based"
    label: { type: String, required: true, trim: true }, // "Need-Based"
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

scholarshipCategorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model("ScholarshipCategory", scholarshipCategorySchema);