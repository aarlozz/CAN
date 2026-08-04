// models/Courses.js

import mongoose from "mongoose";
import {
  STUDY_LEVELS,
  LEVELS_WITH_FACULTY,
  getFacultiesForLevel,
  getProgramsForFaculty,
} from "../constants/educationTaxonomy.js";

// Fixed: taxonomy objects use `id`, not `value`.
const VALID_LEVELS = STUDY_LEVELS.map((l) => l.id);

const courseSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
      index: true,
    },

    level: {
      type: String,
      required: true,
      enum: VALID_LEVELS,
    },

    // Only set for levels that have a faculty step (bachelor's, master's, ...)
    faculty: {
      type: String,
      default: undefined,
      validate: {
        validator: function (val) {
          const needsFaculty = LEVELS_WITH_FACULTY.includes(this.level);
          if (!needsFaculty) return !val; // must be empty for levels without a faculty step
          if (!val) return false; // required when the level has one
          // Fixed: getFacultiesForLevel returns objects, not strings.
          return getFacultiesForLevel(this.level).some((f) => f.id === val);
        },
        message: "Faculty does not match the selected level.",
      },
    },

    // The program id, e.g. "bsc_csit" (not the display name)
    program: {
      type: String,
      default: undefined,
      validate: {
        validator: function (val) {
          const needsFaculty = LEVELS_WITH_FACULTY.includes(this.level);
          if (!needsFaculty) return !val;
          if (!val || !this.faculty) return false;
          // Fixed: getProgramsForFaculty returns objects, not strings.
          return getProgramsForFaculty(this.level, this.faculty).some((p) => p.id === val);
        },
        message: "Program does not match the selected faculty.",
      },
    },

    duration: { type: String, trim: true }, // display string, e.g. "4 years"
    durationYears: { type: Number }, // structured value, set by institution at add-time

    description: { type: String, trim: true }, // no longer required

    // Soft-disable instead of hard delete, so old scholarships/applications
    // that reference this course still resolve correctly.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Prevent the same institution from registering the identical offering twice
courseSchema.index(
  { institution: 1, level: 1, faculty: 1, program: 1 },
  { unique: true },
);

export default mongoose.model("Courses", courseSchema);