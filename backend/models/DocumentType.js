import mongoose from "mongoose";

/**
 * DocumentType = one row in the master, admin-editable list of documents
 * (e.g. "SEE Transcript", "Income Certificate").
 *
 * group:
 *   "common"   -> required for every student regardless of level/category
 *   "level"    -> required only for certain study levels (see applicableLevels)
 *   "category" -> required only if the student opted into a special
 *                 scholarship category (see applicableCategories)
 *   "optional" -> never required, always shown as a bonus upload,
 *                 never counted toward completion %
 */
const documentTypeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    }, // e.g. "see_transcript" — stable machine key, never rename after go-live
    label: { type: String, required: true, trim: true }, // "SEE Transcript"
    description: { type: String, trim: true },

    group: {
      type: String,
      enum: ["common", "level", "category", "optional"],
      required: true,
    },

    applicableLevels: [
      { type: String, enum: ["+2", "Bachelor", "Master", "PhD"] },
    ], // only used when group === "level"

    applicableCategories: [{ type: String, trim: true, lowercase: true }],
    // only used when group === "category" — matches ScholarshipCategory.key

    isRequired: { type: Boolean, default: true }, // false = "nice to have" even within its group
    isActive: { type: Boolean, default: true }, // soft delete / hide from students
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

documentTypeSchema.index({ group: 1, isActive: 1 });
documentTypeSchema.index({ applicableLevels: 1 });
documentTypeSchema.index({ applicableCategories: 1 });

export default mongoose.model("DocumentType", documentTypeSchema);