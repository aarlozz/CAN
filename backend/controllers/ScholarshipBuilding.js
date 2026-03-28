import Scholarship from "../models/Scholarship";
import InstitutionProfile from "../models/InstitutionProfile";

export const provideScholarship = async (req, res) => {
  try {
    const {
      scholarshipTitle,
      scholarshipAmount,
      eligibilityCriteria,
      description,
      deadline,
    } = req.body;

    
    const institution = await InstitutionProfile.findOne({
      
    });

    if (!institution) {
      return res.json
        .status(501)
        .json({ message: "Internal server error invalid institution" });
    }

    await Scholarship.create({
      institution: institution._id,
      scholarshipTitle,
      scholarshipAmount,
      eligibilityCriteria,
      description,
      deadline,
    });

    return res.status(200).json({message:"YThe schoalrship has been registered"})
  } catch (error) {}
};
