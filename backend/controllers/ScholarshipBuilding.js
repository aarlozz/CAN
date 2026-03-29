import InstitutionProfile from "../models/InstitutionProfile.js";
import Scholarship from "../models/Scholarship.js";

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
      return res.status(404).json({ message: "Institution not found" });
    }

    const {
      scholarshipTitle,
      coverage,
      eligibilityCriteria,
      totalSeats,
      remainingSeats,
      description,
      termsandCondition,
      deadline,
    } = req.body;

    await Scholarship.create({
      institution: institution._id,
      scholarshipTitle,
      coverage,
      eligibilityCriteria,
      totalSeats,
      remainingSeats,
      description,
      termsandCondition,
      deadline,
    });

    return res.status(200).json({ message: "Scholarship added successfully" });
  } catch (error) {
    return res.status(400).json({
      message: "internal server error institution cant create scholarship",
    });
  }
};
