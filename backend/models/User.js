import mongoose, { now } from "mongoose";

const finaluserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type:     String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type:      String,
      required:  function() { return this.authProvider === 'local'; },
      minlength: 6,
      select:    false,   // never returned by default — must explicitly .select('+password')
    },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },

    googleId: {
      type: String
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

    // Profile photo
    avatar: {
      type: String,     // full public URL, e.g. http://host/uploads/avatars/<userId>/<file>
      default: null,
    },
    avatarPath: {
      type: String,     // relative disk path, used internally to delete the old file
      default: null,
      select: false,    // internal only — never sent to the frontend
    },
  },
  { timestamps: true },
);

finaluserSchema.index({ email: 1 });

export default mongoose.model("User", finaluserSchema);
