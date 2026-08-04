import mongoose from "mongoose";

const programOfferingSchema = new mongoose.Schema(
  {
    programId: { type: String, required: true, index: true },   // matches PROGRAMS[].id
    universityId: { type: String, required: true, index: true }, // matches UNIVERSITIES[].id
    durationYears: { type: Number, required: true },
    isAcceptingAdmissions: { type: Boolean, default: true },
  },
  { timestamps: true },
);

programOfferingSchema.index({ programId: 1, universityId: 1 }, { unique: true });

export default mongoose.model("ProgramOffering", programOfferingSchema);