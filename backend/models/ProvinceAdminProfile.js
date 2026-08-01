import mongoose from "mongoose";

const provinceAdminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    assignedProvince: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

provinceAdminSchema.index({ assignedProvince: 1 });

export default mongoose.model("ProvinceAdminProfile", provinceAdminSchema);
