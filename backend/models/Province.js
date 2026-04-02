import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema(
  {
    provinceName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    provinceCode: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Province", provinceSchema);
