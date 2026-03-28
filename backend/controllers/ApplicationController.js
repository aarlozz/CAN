import Application from "../models/Application.js";
import StudentProfile from "../models/StudentProfile.js";

export const applytToInstitution = async (req, res) => {
  try {
    //fronetend bata hamro institutionid aauxa user le institution click garepaxi
    const { institutionId } = req.body;

    //aba tyo logged in user xa ki nai herney aanu
    const studentProfile = await StudentProfile.findOne({
      user: req.user.id,
    });
    //iff the studentProfile is nto there we must say profile not found
    if (!studentProfile) {
      return res.status(401).json({ mesage: " Student Profile not found" });
    }
    //now after that we create an application for that user with that studentprofile_id and institution id

    const application = await Application.create({
      student: studentProfile._id,
      institution: institutionId,
    });

    return res.status(201).json({
      application,
      message: "Your application has been submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
