import mongoose, { now } from "mongoose";

const finaluserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "student",
        "institution",
        "district_admin",
        "province_admin",
        "super_admin",
      ],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

finaluserSchema.index({ email: 1 });

export default mongoose.model("User", finaluserSchema);
