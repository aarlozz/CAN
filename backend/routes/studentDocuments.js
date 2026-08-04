import express from "express";
import mongoose from "mongoose";
import upload from "../middleware/uploadMemory.js";
import { getBucket } from "../config/gridfs.js";
import StudentProfile from "../models/StudentProfile.js";
import DocumentType from "../models/DocumentType.js";
// Adjust this path to wherever protect/requireRole actually live in your project
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const VALID_LEVELS = ["+2", "Bachelor", "Master", "PhD"];

// ── Helper: required doc types for a given level + selected categories ────
async function getRequiredDocTypes(level, categories = []) {
  return DocumentType.find({
    isActive: true,
    $or: [
      { group: "common" },
      { group: "level", applicableLevels: level },
      ...(categories.length
        ? [{ group: "category", applicableCategories: { $in: categories } }]
        : []),
    ],
  }).sort({ group: 1, sortOrder: 1 });
}

// ── GET /api/student/documents/requirements ─────────────────────────────────
// Returns: required docs (common + level + selected categories) merged with
// what the student has already uploaded, plus completion %, plus the
// always-available "optional" bonus documents (not counted in %).
router.get("/requirements", protect, async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user.id });
    if (!student)
      return res.status(404).json({ message: "Student profile not found" });

    const level = req.query.level || student.currentLevel;
    const categories = req.query.categories
      ? req.query.categories.split(",").filter(Boolean)
      : student.selectedCategories || [];

    const optionalTypes = await DocumentType.find({
      isActive: true,
      group: "optional",
    }).sort({ sortOrder: 1 });

    const uploadedMap = new Map(
      student.documents.map((d) => [d.documentTypeKey, d])
    );

    const toResponseShape = (dt) => {
      const uploadedDoc = uploadedMap.get(dt.key);
      return {
        documentTypeId: dt._id,
        key: dt.key,
        label: dt.label,
        description: dt.description,
        group: dt.group,
        isRequired: dt.isRequired,
        uploaded: !!uploadedDoc,
        document: uploadedDoc
          ? {
              _id: uploadedDoc._id,
              fileId: uploadedDoc.fileId,
              fileName: uploadedDoc.fileName,
              fileSize: uploadedDoc.fileSize,
              mimeType: uploadedDoc.mimeType,
              status: uploadedDoc.status,
              uploadedAt: uploadedDoc.uploadedAt,
            }
          : null,
      };
    };

    if (!level) {
      return res.json({
        level: null,
        categories,
        requiredDocuments: [],
        optionalDocuments: optionalTypes.map(toResponseShape),
        completionPercent: 0,
        totalRequired: 0,
        totalUploaded: 0,
        message: "Select your current study level first.",
      });
    }

    const requiredTypes = await getRequiredDocTypes(level, categories);
    const requiredDocuments = requiredTypes.map(toResponseShape);

    const mandatoryDocs = requiredDocuments.filter((d) => d.isRequired);
    const uploadedMandatory = mandatoryDocs.filter((d) => d.uploaded);
    const completionPercent = mandatoryDocs.length
      ? Math.round((uploadedMandatory.length / mandatoryDocs.length) * 100)
      : 0;

    res.json({
      level,
      categories,
      requiredDocuments,
      optionalDocuments: optionalTypes.map(toResponseShape),
      completionPercent,
      totalRequired: mandatoryDocs.length,
      totalUploaded: uploadedMandatory.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load requirements", error: err.message });
  }
});

// ── PUT /api/student/documents/level ────────────────────────────────────────
router.put("/level", protect, async (req, res) => {
  try {
    const { level } = req.body;
    if (!VALID_LEVELS.includes(level)) {
      return res.status(400).json({ message: "Invalid level" });
    }
    const student = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { currentLevel: level },
      { new: true }
    );
    if (!student)
      return res.status(404).json({ message: "Student profile not found" });
    res.json({ message: "Level updated", currentLevel: student.currentLevel });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update level", error: err.message });
  }
});

// ── PUT /api/student/documents/categories ───────────────────────────────────
router.put("/categories", protect, async (req, res) => {
  try {
    const { categories } = req.body; // array of category keys
    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: "categories must be an array" });
    }
    const student = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { selectedCategories: categories },
      { new: true }
    );
    if (!student)
      return res.status(404).json({ message: "Student profile not found" });
    res.json({
      message: "Categories updated",
      selectedCategories: student.selectedCategories,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update categories", error: err.message });
  }
});

// ── POST /api/student/documents/upload ──────────────────────────────────────
// multipart/form-data: file=<binary>, documentTypeKey=<string>
// If a document of this type was already uploaded, the old GridFS file is
// deleted and replaced (upload acts as "replace" too).
router.post(
  "/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { documentTypeKey } = req.body;
      if (!documentTypeKey) {
        return res.status(400).json({ message: "documentTypeKey is required" });
      }

      const docType = await DocumentType.findOne({
        key: documentTypeKey,
        isActive: true,
      });
      if (!docType) {
        return res.status(400).json({ message: "Unknown document type" });
      }

      const student = await StudentProfile.findOne({ user: req.user.id });
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const bucket = getBucket();

      // Replace: delete old GridFS file + array entry for this type, if any
      const existingIndex = student.documents.findIndex(
        (d) => d.documentTypeKey === documentTypeKey
      );
      if (existingIndex !== -1) {
        const oldFileId = student.documents[existingIndex].fileId;
        try {
          await bucket.delete(new mongoose.Types.ObjectId(oldFileId));
        } catch (e) {
          // old GridFS file already gone — safe to ignore
        }
        student.documents.splice(existingIndex, 1);
      }

      // Stream the buffer straight into GridFS
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { studentId: student._id, documentTypeKey },
      });

      uploadStream.on("error", (err) => {
        res.status(500).json({ message: "Upload failed", error: err.message });
      });

      uploadStream.on("finish", async () => {
        try {
          student.documents.push({
            documentType: docType._id,
            documentTypeKey: docType.key,
            fileId: uploadStream.id,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            status: "uploaded",
          });
          await student.save();

          res.status(201).json({
            message: "Document uploaded",
            document: student.documents[student.documents.length - 1],
          });
        } catch (err) {
          res
            .status(500)
            .json({ message: "Failed to save document record", error: err.message });
        }
      });

      uploadStream.end(req.file.buffer);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to upload document", error: err.message });
    }
  }
);

// ── GET /api/student/documents/file/:fileId ─────────────────────────────────
// Streams the raw file back (viewed in a new tab / downloaded from the frontend).
router.get("/file/:fileId", protect, async (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ message: "File not found" });

    res.set("Content-Type", files[0].contentType || "application/octet-stream");
    res.set("Content-Disposition", `inline; filename="${files[0].filename}"`);

    bucket
      .openDownloadStream(fileId)
      .on("error", () => res.status(404).end())
      .pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch file", error: err.message });
  }
});

// ── DELETE /api/student/documents/:documentId ───────────────────────────────
router.delete("/:documentId", protect, async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user.id });
    if (!student)
      return res.status(404).json({ message: "Student profile not found" });

    const doc = student.documents.id(req.params.documentId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const bucket = getBucket();
    try {
      await bucket.delete(new mongoose.Types.ObjectId(doc.fileId));
    } catch (e) {
      // GridFS file already gone — safe to ignore
    }

    doc.deleteOne();
    await student.save();

    res.json({ message: "Document removed" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete document", error: err.message });
  }
});

export default router;