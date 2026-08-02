import mongoose from "mongoose";
import {
  STUDY_LEVELS,
  LEVELS_WITH_FACULTY,
  getFacultiesForLevel,
  getProgramsForFaculty,
} from "../constants/educationTaxonomy.js";

const VALID_LEVELS = STUDY_LEVELS.map((l) => l.value);

const courseSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile", // must exactly match mongoose.model("InstitutionProfile", ...)
      required: true,
      index: true,
    },

    level: {
      type: String,
      required: true,
      enum: VALID_LEVELS,
    },

    // Only set for levels that have a faculty step (bachelors, masters, ...)
    faculty: {
      type: String,
      default: undefined,
      validate: {
        validator: function (val) {
          const needsFaculty = LEVELS_WITH_FACULTY.includes(this.level);
          if (!needsFaculty) return !val; // must be empty for levels without a faculty step
          if (!val) return false; // required when the level has one
          return getFacultiesForLevel(this.level).includes(val);
        },
        message: "Faculty does not match the selected level.",
      },
    },

    // The actual degree/program name, e.g. "B.Sc. Computer Science"
    program: {
      type: String,
      default: undefined,
      validate: {
        validator: function (val) {
          const needsFaculty = LEVELS_WITH_FACULTY.includes(this.level);
          if (!needsFaculty) return !val;
          if (!val || !this.faculty) return false;
          return getProgramsForFaculty(this.level, this.faculty).includes(val);
        },
        message: "Program does not match the selected faculty.",
      },
    },

    duration: { type: String, trim: true }, // e.g. "4 years" — string, not Number
    description: { type: String, trim: true, required: true },

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
