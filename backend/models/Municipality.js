import mongoose from "mongoose";

const municipalitySchema = new mongoose.Schema(
  {
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    districtName: {
      type: String,
      trim: true,
    }, // Denormalized
    municipalityName: {
      type: String,
      required: true,
      trim: true,
    },
    municipalityType: {
      type: String,
      enum: [
        "Metropolitan",
        "Sub-Metropolitan",
        "Municipality",
        "Rural Municipality",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

municipalitySchema.index({ districtId: 1 });
municipalitySchema.index({ municipalityName: 1 });

export default mongoose.model("Municipality", municipalitySchema);
