import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================================================
   📁 STORAGE CONFIG
   Saves files to: uploads/institution-logos/{userId}/logo_{timestamp}.{ext}
========================================================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return cb(new Error("User not authenticated"), null);
      }
      const uploadPath = path.join("uploads", "institution-logos", userId);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo_${Date.now()}${ext}`);
  },
});

/* =========================================================
   📦 FILE FILTER — images only
========================================================= */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, or WEBP allowed."), false);
  }
};

/* =========================================================
   ⚙️ MULTER CONFIG
========================================================= */
const logoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
});

export default logoUpload;