import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: true,
    },
    provinceName: {
      type: String,
      trim: true,
    }, // Denormalized for quick reads
    districtName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

districtSchema.index({ provinceId: 1 });
districtSchema.index({ districtName: 1 });

export default mongoose.model("District", districtSchema);