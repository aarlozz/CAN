import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================================================
   📁 STORAGE CONFIG
   Saves files to:
   uploads/students/{userId}/{fieldname}/{timestamp_filename}
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return cb(new Error("User not authenticated"), null);
      }

      const uploadPath = path.join(
        "uploads",
        "students",
        userId,
        file.fieldname
      );

      // Create folder if not exists
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    // Remove unsafe characters from filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");

    // Add timestamp to avoid duplicates
    const uniqueName = `${Date.now()}_${safeName}`;

    cb(null, uniqueName);
  },
});

/* =========================================================
   📦 FILE FILTER (security layer)
   Only allows PDF, JPG, PNG
========================================================= */

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, JPG, PNG allowed."),
      false
    );
  }
};

/* =========================================================
   ⚙️ MULTER CONFIG
========================================================= */

const upload = multer({
  storage,
  fileFilter,

  limits: {
    // Max file size per upload
    fileSize: 5 * 1024 * 1024, // 5MB

    // Optional safety limit (helps prevent abuse)
    files: 1,
  },
});

export default upload;