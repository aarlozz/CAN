// controllers/admin/programOfferingController.js
//
// Admin CRUD for ProgramOffering — the DB-backed table institutions'
// course catalog reads from. Single-row endpoints for manual entry through
// an admin UI, plus a bulk endpoint for pasting in a spreadsheet/CSV export
// at once.

import ProgramOffering from "../../models/ProgramOffering.js";
import {
  findProgramById,
  findUniversityById,
} from "../../constants/educationTaxonomy.js";

function validateRow({ programId, universityId, durationYears }) {
  if (!programId || !findProgramById(programId)) {
    return `Unknown programId: ${programId}`;
  }
  if (!universityId || !findUniversityById(universityId)) {
    return `Unknown universityId: ${universityId}`;
  }
  if (durationYears == null || Number.isNaN(Number(durationYears)) || Number(durationYears) <= 0) {
    return `Invalid durationYears for ${programId}/${universityId}: ${durationYears}`;
  }
  return null;
}

// GET /api/admin/program-offerings?universityId=tu&programId=bba
export const listOfferings = async (req, res) => {
  try {
    const { universityId, programId } = req.query;
    const filter = {};
    if (universityId) filter.universityId = universityId;
    if (programId) filter.programId = programId;

    const offerings = await ProgramOffering.find(filter).sort({ universityId: 1, programId: 1 });

    // Attach display names so the admin UI doesn't need to re-look-up ids
    const enriched = offerings.map((o) => ({
      ...o.toObject(),
      programName: findProgramById(o.programId)?.name || o.programId,
      universityName: findUniversityById(o.universityId)?.name || o.universityId,
    }));

    res.json({ offerings: enriched, count: enriched.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/program-offerings
// body: { programId, universityId, durationYears, isAcceptingAdmissions? }
export const createOrUpdateOffering = async (req, res) => {
  try {
    const { programId, universityId, durationYears, isAcceptingAdmissions } = req.body;

    const err = validateRow({ programId, universityId, durationYears });
    if (err) return res.status(400).json({ message: err });

    const offering = await ProgramOffering.findOneAndUpdate(
      { programId, universityId },
      {
        durationYears: Number(durationYears),
        ...(isAcceptingAdmissions !== undefined && { isAcceptingAdmissions }),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ message: "Offering saved.", offering });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/program-offerings/bulk
// body: { offerings: [{ programId, universityId, durationYears, isAcceptingAdmissions? }, ...] }
// Use this to paste in a whole spreadsheet's worth at once. Validates every
// row up front and reports per-row errors instead of failing silently
// partway through.
export const bulkUpsertOfferings = async (req, res) => {
  try {
    const { offerings } = req.body;
    if (!Array.isArray(offerings) || offerings.length === 0) {
      return res.status(400).json({ message: "offerings array is required." });
    }

    const errors = [];
    const validRows = [];

    offerings.forEach((row, idx) => {
      const err = validateRow(row);
      if (err) errors.push({ row: idx, message: err });
      else validRows.push(row);
    });

    const results = await Promise.allSettled(
      validRows.map((row) =>
        ProgramOffering.findOneAndUpdate(
          { programId: row.programId, universityId: row.universityId },
          {
            durationYears: Number(row.durationYears),
            ...(row.isAcceptingAdmissions !== undefined && {
              isAcceptingAdmissions: row.isAcceptingAdmissions,
            }),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ),
      ),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        errors.push({ row: i, message: r.reason?.message || "Unknown error" });
      }
    });

    res.status(errors.length > 0 ? 207 : 200).json({
      message: `${succeeded} offering(s) saved. ${errors.length} row(s) failed.`,
      succeeded,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/program-offerings/:id
export const deleteOffering = async (req, res) => {
  try {
    const offering = await ProgramOffering.findByIdAndDelete(req.params.id);
    if (!offering) {
      return res.status(404).json({ message: "Offering not found." });
    }
    res.json({ message: "Offering deleted.", offering });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/program-offerings/coverage
// Diagnostic: which universities have ZERO offerings seeded yet, so an
// admin knows where data entry is most needed.
export const getCoverageReport = async (req, res) => {
  try {
    const counts = await ProgramOffering.aggregate([
      { $group: { _id: "$universityId", count: { $sum: 1 } } },
    ]);
    const countByUniversity = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    const { UNIVERSITIES } = await import("../../constants/educationTaxonomy.js");
    const report = UNIVERSITIES.filter((u) => u.group === "nepal").map((u) => ({
      universityId: u.id,
      universityName: u.name,
      offeringsCount: countByUniversity[u.id] || 0,
    }));

    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};