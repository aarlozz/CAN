// middleware/avatarUpload.js
//
// Multer config for profile-photo uploads.
// Used by: routes/userRoutes.js → POST /api/user/avatar
//
// Storage layout matches what userController.js expects:
//   uploads/avatars/<userId>/<filename>
// so the "delete previous avatar file" logic in uploadAvatar() can find it.

import fs from "fs";
import path from "path";
import multer from "multer";

const MAX_AVATAR_MB = 2;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.user is set by the `protect` middleware, which must run before this
    const userDir = path.join("uploads", "avatars", req.user.id);

    // multer does NOT create nested directories itself — must do it manually,
    // otherwise every upload fails with a generic ENOENT error
    fs.mkdir(userDir, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, userDir);
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Please upload a JPG, PNG, or WEBP image."));
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_AVATAR_MB * 1024 * 1024 },
});

export default avatarUpload;