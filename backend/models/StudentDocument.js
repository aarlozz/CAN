import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    student: {
      //this helps to provide unique object id to each dosument of a student
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    document: {
      type: String,
      required: true,
      enum: ["Photo", "Citizenship", "SEE Marksheet", "+2 Transcript", "Other"],
    },
    //this helps to get location of where the file is stored
    fileurl: {
      type: String,
    },
    filename: {
      type: String,
    },
    filesize: {
      type: Number,
    },
  },
  { timestamps: true },
);

documentSchema.index({"student":1})

export default mongoose.model("StudentDocument", documentSchema)
