import multer from "multer";

// NOTE: this is a SEPARATE multer instance from your existing
// middleware/upload.js (which uses diskStorage for avatars etc.).
// This one uses memoryStorage so req.file.buffer can be streamed
// straight into GridFS — nothing touches local disk here.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — adjust as needed

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, WEBP, or PDF files are allowed."),
        false
      );
    }
    cb(null, true);
  },
});

export default upload;