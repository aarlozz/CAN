import express from "express";
import DocumentType from "../models/DocumentType.js";
import ScholarshipCategory from "../models/ScholarshipCategory.js";
// Adjust this path to wherever protect/requireRole actually live in your project
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET /api/document-types ─────────────────────────────────────────────────
// Any logged-in user: fetch the active master lists (used by the frontend
// to render the level selector, category checkboxes, and checklist labels).
router.get("/", protect, async (req, res) => {
  try {
    const documentTypes = await DocumentType.find({ isActive: true }).sort({
      group: 1,
      sortOrder: 1,
    });
    const categories = await ScholarshipCategory.find({
      isActive: true,
    }).sort({ sortOrder: 1 });

    res.json({ documentTypes, categories });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load document types", error: err.message });
  }
});

// ── Admin: Document Types CRUD ──────────────────────────────────────────────
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const docType = await DocumentType.create(req.body);
    res.status(201).json(docType);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create document type", error: err.message });
  }
});

router.put("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const docType = await DocumentType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!docType) return res.status(404).json({ message: "Not found" });
    res.json(docType);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update document type", error: err.message });
  }
});

// Soft delete (deactivate) rather than hard delete — keeps historical
// uploads referencing this type intact.
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const docType = await DocumentType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!docType) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Document type deactivated", docType });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to deactivate document type", error: err.message });
  }
});

// ── Admin: Scholarship Categories CRUD ─────────────────────────────────────
router.post(
  "/categories",
  protect,
  requireRole("admin"),
  async (req, res) => {
    try {
      const category = await ScholarshipCategory.create(req.body);
      res.status(201).json(category);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to create category", error: err.message });
    }
  }
);

router.put(
  "/categories/:id",
  protect,
  requireRole("admin"),
  async (req, res) => {
    try {
      const category = await ScholarshipCategory.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!category) return res.status(404).json({ message: "Not found" });
      res.json(category);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to update category", error: err.message });
    }
  }
);

router.delete(
  "/categories/:id",
  protect,
  requireRole("admin"),
  async (req, res) => {
    try {
      const category = await ScholarshipCategory.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!category) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Category deactivated", category });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to deactivate category", error: err.message });
    }
  }
);

export default router;