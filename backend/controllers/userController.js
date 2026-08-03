import fs from "fs";
import path from "path";
import User from "../models/User.js";

// GET /api/user/me — lightweight identity/avatar fetch, used by the header
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role avatar");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/user/avatar  (multipart/form-data, field name: "avatar")
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file received." });
    }
    const user = await User.findById(req.user.id).select("+avatarPath");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Best-effort delete of the previous avatar file so disk doesn't fill up
    if (user.avatarPath) {
      fs.unlink(user.avatarPath, () => {});
    }
    const relativePath = path
      .join("uploads", "avatars", req.user.id, req.file.filename)
      .replace(/\\/g, "/");
    user.avatarPath = relativePath;
    user.avatar = `${req.protocol}://${req.get("host")}/${relativePath}`;
    await user.save();
    res.json({ message: "Profile photo updated.", avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/user/avatar
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+avatarPath");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.avatarPath) {
      fs.unlink(user.avatarPath, () => {});
    }
    user.avatar = null;
    user.avatarPath = null;
    await user.save();
    res.json({ message: "Profile photo removed.", avatar: null });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};