import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },

    scholarshipTitle: {
      type: String,
      required: true,
    },

    coverage: {
      scholarshiptype: {
        type: String,
        enum: [
          "full_tuition",
          "partial_tuition",
          "merit_based",
          "need_based",
          "disability",
          "gender",
          "ethnic",
        ],
        required: true,

        scholarshipAmountNpr: {
          type: Number,
          min: 0,
        },

        scholarshipPercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    },

    eligilityCriteria: {
      targetlevel: {
        type: String,
        enum: ["plus_two", "bachelor", "master", "mphil", "phd", "diploma"],
        required: true,
      },

      targetFaculty: {
        type: String,
        required: true,
      },

      subject: {
        type: String,
        required: true,
      },

      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },

      isNepali: {
        type: Booelan,
        default: true
      },

      hasdisability:{

      }
    },

    description: String,
    termsandCondition: String,

    deadline: Date,
  },
  { timestamps: true },
);
scholarshipSchema.index({ institution: 1 });
scholarshipSchema.index({ scholarshipTitle: 1 });
scholarshipSchema.index({ scholarshipAmount: 1 });

export default mongoose.model("Scholarship", scholarshipSchema);
