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

    if (req.user.status !== "approved") {
      return res.status(403).json({
        message: "Only approved institution can add scholarship",
      });
    }
    //aba tyo user kun institution vanera vettaune
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });
    if (!institution) {
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

    if (!scholarshipTitle || !coverage || !totalSeats || !deadline) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    if (!coverage || !coverage.scholarshipType) {
      return res.status(400).json({ message: "Scholarship type required" });
    }

    if (
      !coverage ||
      (coverage.scholarshipAmountNpr == null &&
        coverage.scholarshipPercentage == null)
    ) {
      return res.status(400).json({
        message: "Provide amount or percentage",
      });
    }

    await Scholarship.create({
      institution: institution._id,
      scholarshipTitle,
      coverage,
      eligibilityCriteria,
      totalSeats,
      remainingSeats: remainingSeats || totalSeats,

      description,
      termsandCondition,
      deadline,
    });

    return res.status(201).json({ message: "Scholarship added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "internal server error institution cant create scholarship",
    });
  }
};

// this is for th institution to see data of all the scholarships they have added
export const getmyScholarship = async (req, res) => {
  try {
    if (req.user.role !== "institution") {
      return res
        .status(403)
        .json({ message: "Only institution can view the scholarship" });
    }
    //tyo user ko institution profile xa ki nai herney

    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });
    if (!institution) {
      return res.status(404).json({ message: " Insitution profile not found" });
    }
    //so esma chai user le haleko query url bata read garxa query ma kei xa vane rakhxa natra "" expty hunxa
    const search = req.query.search || "";

    //aaba chai filter garney object banako
    //this institution or yei instituiton ko scholarship matra liney

    //this is mongodb query builder
    const filter = {
      institution: institution._id,
      scholarshipTitle: { $regex: search, $options: "i" },
    };
    // instituion._id =>only scholarship of looged in institution
    //$regex => pattern matching //pattern haru eherxa like eng in engineering etc
    //$options :"i" upper ra lower case herdaina

    const foundscholarship = await Scholarship.find(filter).sort({
      createdAt: -1,
    });
    //esma filter bata tyo schoalrship find garxa aani sort le newest data suru ma rakhxa

    return res.status(200).json({
      //count le chai total scholarship aani pagination ma frontend ma help garxa
      count: foundscholarship.length,
      foundscholarship,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal sever error" });
  }
};
