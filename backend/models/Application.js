import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ student: 1 });
applicationSchema.index({ institution: 1 });
applicationSchema.index({ status: 1 });

export default mongoose.model("Appplication", applicationSchema);
