import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  institutionName: {
    type: String,
    required: true,
    trim: true,
  },
  institutionType: {
    type: String,
    required: true,
    enum: ["School", "College", "University"],
  },
  establishedYear: {
    type: Number,
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
    municipality: {
      type: String,
    },
    ward: {
      type: String,
    },
    street: {
      type: String,
    },
  },

  website: {
    type: String,
  },
  description: {
    type: String,
  },

  contactPerson: {
    name: String,
    phone: String,
    email: String,
    designation: String,
  },

  isApproved:{
    type: Boolean,
    default: false
  },
},
{ timestamps: true});

institutionSchema.index({"location.province": 1})
institutionSchema.index({"location.district": 1})
institutionSchema.index({"institutionName": 1})

export default mongoose.model("InstitutionProfile", institutionSchema)
