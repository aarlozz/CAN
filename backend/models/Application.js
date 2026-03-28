import mongoose, { now } from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      unique: true,
    },

    institution:{
      type: mongoose.Schema.Typesd.ObjectId,
      ref: "InstitutionProfile",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: {
      date: now,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appplication", applicationSchema);
