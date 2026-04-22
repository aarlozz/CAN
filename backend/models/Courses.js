import mongoose from "mongoose";

// TODO: further fields to be discussed and added

const courseSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",  // ✅ was "InstitutonProfile" (typo)
      required: true,             // ✅ was "require" (typo)
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    levels: {
      type: String,
      required: true,
      enum: ["school", "+2", "bachelors"],  // ✅ was "eum" (typo)
    },

    duration: Number,             // ✅ was "Numbe" (typo)
    description: String,
  },
  { timestamps: true }
);

courseSchema.index({ institution: 1 });
courseSchema.index({ courseName: 1 });  // ✅ was "coursesName" (typo)

export default mongoose.model("Courses", courseSchema);