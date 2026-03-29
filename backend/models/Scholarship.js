import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },

    scolarshipTitle: {
      type: String,
      required: true,
    },

    scholarshipAmount: Number,

    eligiilityCriteria: String,
    description: String,

    deadline: Date,
  },
  { timestamps: true },
);
scholarshipSchema.index({ institution: 1 });
scholarshipSchema.index({ scholarshipTitle: 1 });
scholarshipSchema.index({ scholarshipAmount: 1 });

export default mongoose.model("Scholarship", scholarshipSchema);
