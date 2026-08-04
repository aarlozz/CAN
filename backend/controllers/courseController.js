// controllers/courseController.js

import Courses from "../models/Courses.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import ProgramOffering from "../models/ProgramOffering.js";
import {
  STUDY_LEVELS_BY_ID,
  LEVELS_WITH_FACULTY,
  getFacultiesForLevel,
  getProgramsForFaculty,
  getGoverningBodyLabel,
  isUniversityAffiliatedLevel,
} from "../constants/educationTaxonomy.js";

async function getMyInstitution(userId) {
  return InstitutionProfile.findOne({ user: userId });
}

// GET /api/institution/courses
export const listMyCourses = async (req, res) => {
  try {
    const institution = await getMyInstitution(req.user.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const courses = await Courses.find({
      institution: institution._id,
      isActive: true,
    });

    res.json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/institution/courses/catalog?level=bachelor
export const getCourseCatalog = async (req, res) => {
  try {
    const { level } = req.query;
    if (!level || !STUDY_LEVELS_BY_ID[level]) {
      return res.status(400).json({ message: "Valid level is required." });
    }

    const institution = await getMyInstitution(req.user.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const needsFaculty = LEVELS_WITH_FACULTY.includes(level);
    if (!needsFaculty) {
      return res.json({
        level,
        needsFaculty: false,
        governingBodyLabel: getGoverningBodyLabel(level),
        faculties: [],
      });
    }

    const existing = await Courses.find(
      { institution: institution._id, level, isActive: true },
      "faculty program",
    );
    const existingSet = new Set(existing.map((c) => `${c.faculty}:${c.program}`));

    const universityAffiliated = isUniversityAffiliatedLevel(level);
    // NOTE: assumes InstitutionProfile has a `university` field holding a
    // taxonomy university id (e.g. "tu", "ku"). Rename below if yours differs.
    const offerings =
      universityAffiliated && institution.university
        ? await ProgramOffering.find({ universityId: institution.university })
        : [];
    const offeringByProgramId = Object.fromEntries(
      offerings.map((o) => [o.programId, o]),
    );

    const faculties = getFacultiesForLevel(level).map((f) => ({
      id: f.id,
      name: f.name,
      programs: getProgramsForFaculty(level, f.id).map((p) => {
        const offering = offeringByProgramId[p.id];
        return {
          id: p.id,
          name: p.name,
          defaultDurationYears: offering?.durationYears ?? p.typicalDurationYears,
          confirmedForYourUniversity: Boolean(offering),
          alreadyAdded: existingSet.has(`${f.id}:${p.id}`),
        };
      }),
    }));

    res.json({
      level,
      needsFaculty: true,
      universityAffiliated,
      governingBodyLabel: getGoverningBodyLabel(level),
      faculties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/institution/courses/bulk
// body: { level, selections: [{ facultyId, programId, durationYears }] }
export const addCoursesBulk = async (req, res) => {
  try {
    const { level, selections } = req.body;
    if (!level) {
      return res.status(400).json({ message: "level is required." });
    }

    const needsFaculty = LEVELS_WITH_FACULTY.includes(level);
    if (needsFaculty && (!Array.isArray(selections) || selections.length === 0)) {
      return res.status(400).json({ message: "Select at least one course." });
    }

    const institution = await getMyInstitution(req.user.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const docs = needsFaculty
      ? selections.map((s) => ({
          institution: institution._id,
          level,
          faculty: s.facultyId,
          program: s.programId,
          durationYears: s.durationYears || undefined,
          duration: s.durationYears ? `${s.durationYears} years` : undefined,
          isActive: true,
        }))
      : [{ institution: institution._id, level, isActive: true }];

    try {
      const result = await Courses.insertMany(docs, { ordered: false });
      return res
        .status(201)
        .json({ message: "Courses added.", insertedCount: result.length });
    } catch (bulkErr) {
      const inserted =
        bulkErr.insertedDocs?.length ?? bulkErr.result?.result?.nInserted ?? 0;
      const dupCount = (bulkErr.writeErrors || []).filter(
        (e) => e.code === 11000,
      ).length;
      return res.status(207).json({
        message: `Added ${inserted} course(s). ${dupCount} were already on your list and skipped.`,
        insertedCount: inserted,
        skipped: dupCount,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/institution/courses/:courseId  (soft delete)
export const removeCourse = async (req, res) => {
  try {
    const institution = await getMyInstitution(req.user.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const course = await Courses.findOneAndUpdate(
      { _id: req.params.courseId, institution: institution._id },
      { isActive: false },
      { new: true },
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.json({ message: "Course removed.", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};