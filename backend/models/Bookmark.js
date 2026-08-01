import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent the same user from bookmarking the same scholarship twice
bookmarkSchema.index({ user: 1, scholarship: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);