
// middleware/uploadAvatar.js
//
// Multer disk storage for profile photo uploads. Must run AFTER `protect`
// in the route chain — it reads req.user.id to build the per-user folder,
// so the auth middleware has to populate req.user first.
//
// Files land at:  uploads/avatars/<userId>/<timestamp>-<originalname>
// Served at:       ${BASE_URL}/uploads/avatars/<userId>/<timestamp>-<originalname>
// (see app.js wiring notes at the bottom of userRoutes.js)

import multer from "multer";
import path from "path";
import fs from "fs";

const AVATAR_ROOT = path.join(process.cwd(), "uploads", "avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(AVATAR_ROOT, String(req.user.id));
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}${ext}`);
  },
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, or WEBP images are allowed."));
  }
  cb(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB — matches MAX_AVATAR_MB in ProfileView.jsx
});

export { AVATAR_ROOT };