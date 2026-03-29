import InstitutionProfile from "../models/InstitutionProfile";
import Scholarship from "../models/Scholarship";

export const createScholarship = async (req, res) => {
  try {
    //suru ma request garney user ko role institution xa ki nai check garney
    if (req.user.role !== "institution") {
      return res.status(403).json({
        message: "Only institution can add scholarship",
      });
    }
    //aba tyo user kun institution vanera vettaune
    const insititution = await InstitutionProfile.findOne({
      user: req.user.id,
    });
    if (!insititution) {
      return res.status(500).json({ message: "Institution not found" });
    }

    const { scholarshipTitle } = req.body;

    Scholarship.create({
      insititution: insititution._id,
      scholarshipTitle,
    });

    return res.status(200).json({message:"Scholarship added successfully"})
  } catch {error}
};
