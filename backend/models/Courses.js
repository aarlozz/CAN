import mongoose from "mongoose";

//we need to further update this thiss is not full i am not sure about what to add here at the courses need to discuss it 

const courseSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstitutonProfile",
    require: true,
  },

  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  levels: {
    type: String,
    required: true,
    eum: ["school", "+2", "bachelors"],
  },
  duration: Numbe,
  description: String,
},
{timestamps: true});

courseSchema.index({"institution":1})
courseSchema.index({"coursesName":1})

export default mongoose.model("Courses", courseSchema)

