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
    //Coverage of Schoalrship
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
      },

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

    //Eligibilitycriteria

    eligibilityCriteria: {
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

      location: {
        province: {
          type: String,
          required: true,
        },
        district: {
          type: String,
          required: true,
        },
      },

      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },

      isNepali: {
        type: Boolean,
        default: true,
      },

      hasDisability: {
        type: Boolean,
        default: false,
      },
    },

    //Application details

    totalSeats: {
      type: Number,
      min: 1,
    },
    remainingSeats: {
      type: Number,
      min: 0,

      validate: {
        validate: {
          validator: function (val) {
            return val <= this.totalSeats;
          },
          message: "remainingSeats cannot exceed totalSeats",
        },
      },
    },

    description: String,
    termsandCondition: String,

    deadline: Date,
  },
  { timestamps: true },
);
scholarshipSchema.index({ institution: 1 });
scholarshipSchema.index({ scholarshipTitle: 1 });
scholarshipSchema.index({ "coverage.scholarshipAmountNpr": 1 });
scholarshipSchema.index({ "coverage.scholarshipType": 1 });
scholarshipSchema.index({ "location.province": 1 });
scholarshipSchema.index({ "location.district": 1 });

export default mongoose.model("Scholarship", scholarshipSchema);
