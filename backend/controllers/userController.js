// controllers/userController.js

import path from "path";
import fs from "fs";
import User from "../models/User.js";

// Turns a saved absolute file path into the public URL the frontend expects
// in profile.user.avatar (ProfileView.jsx renders this directly as <img src>).
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

function toPublicUrl(absolutePath) {
  const relative = path
    .relative(process.cwd(), absolutePath)
    .split(path.sep)
    .join("/"); // Windows-safe
  return `${BASE_URL}/${relative}`;
}

// Deletes the previous avatar file from disk, if any. Never throws — a
// missing/already-deleted file shouldn't block the new upload or the delete
// request from succeeding.
async function removeOldAvatarFile(avatarPath) {
  if (!avatarPath) return;
  try {
    await fs.promises.unlink(avatarPath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Failed to remove old avatar file:", err.message);
    }
  }
}

// POST /api/user/avatar  (multipart/form-data, field "avatar")
// Requires: protect, then uploadAvatar.single("avatar") to run first —
// req.file is populated by multer by the time this runs.
export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file received." });
    }

    const user = await User.findById(req.user.id).select("+avatarPath");
    if (!user) {
      // Clean up the file we just wrote since we can't attach it to anyone.
      await removeOldAvatarFile(req.file.path);
      return res.status(404).json({ message: "User not found." });
    }

    const oldAvatarPath = user.avatarPath;

    user.avatar = toPublicUrl(req.file.path);
    user.avatarPath = req.file.path;
    await user.save();

    // Remove the previous photo only after the new one is safely saved.
    await removeOldAvatarFile(oldAvatarPath);

    res.json({ message: "Avatar updated.", avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload avatar." });
  }
};

// DELETE /api/user/avatar
export const deleteUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+avatarPath");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await removeOldAvatarFile(user.avatarPath);

    user.avatar = null;
    user.avatarPath = null;
    await user.save();

    res.json({ message: "Avatar removed." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to remove avatar." });
  }
};