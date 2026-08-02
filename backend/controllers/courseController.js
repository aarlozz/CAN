import Courses from "../models/Courses.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import { LEVELS_WITH_FACULTY } from "../constants/educationTaxonomy.js";

async function getMyInstitution(userId) {
  return InstitutionProfile.findOne({ user: userId });
}

export const listMyCourses = async (req, res) => {
  try {
    console.log("User:", req.user);

    const institution = await getMyInstitution(req.user.id);

    console.log("Institution:", institution);

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const courses = await Courses.find({
      institution: institution._id,
      isActive: true,
    });

    console.log("Courses:", courses);

    res.json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/institution/courses
export const addCourse = async (req, res) => {
  try {
    const { level, faculty, program, duration, description } = req.body;

    if (!level) {
      return res.status(400).json({ message: "level is required." });
    }
    const needsFaculty = LEVELS_WITH_FACULTY.includes(level);
    if (needsFaculty && (!faculty || !program)) {
      return res
        .status(400)
        .json({ message: "faculty and program are required for this level." });
    }
    if (!description || !description.trim()) {
      return res
        .status(400)
        .json({ message: "A short description of what you teach is required." });
    }

    const institution = await getMyInstitution(req.user.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const course = await Courses.create({
      institution: institution._id,
      level,
      faculty: needsFaculty ? faculty : undefined,
      program: needsFaculty ? program : undefined,
      duration,
      description,
    });

    res.status(201).json({ message: "Course added.", course });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "This institution already offers this course." });
    }
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/institution/courses/:courseId
export const updateCourse = async (req, res) => {
  try {
    const { level, faculty, program, duration, description } = req.body;

    if (!level) {
      return res.status(400).json({ message: "level is required." });
    }
    const needsFaculty = LEVELS_WITH_FACULTY.includes(level);
    if (needsFaculty && (!faculty || !program)) {
      return res
        .status(400)
        .json({ message: "faculty and program are required for this level." });
    }
    if (!description || !description.trim()) {
      return res
        .status(400)
        .json({ message: "A short description of what you teach is required." });
    }

    const institution = await getMyInstitution(req.user.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const course = await Courses.findOneAndUpdate(
      { _id: req.params.courseId, institution: institution._id },
      {
        level,
        faculty: needsFaculty ? faculty : undefined,
        program: needsFaculty ? program : undefined,
        duration,
        description,
      },
      { new: true, runValidators: true },
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json({ message: "Course updated.", course });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "This institution already offers this course." });
    }
    res.status(500).json({ error: error.message });
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