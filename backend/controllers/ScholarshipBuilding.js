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

    // if (req.user.status !== "approved") {
    //   return res.status(403).json({
    //     message: "Only approved institution can add scholarship",
    //   });
    // }
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

import InstitutionProfile from "../models/InstitutionProfile.js";
import Scholarship from "../models/Scholarship.js";

export const getAllScholarships = async (req, res) => {
  try {
    // ------------------------------
    // 1️⃣ Extract query parameters from URL
    // ------------------------------
    const search = req.query.search || ""; // General search text (scholarship title, institution, coverage)
    const province = req.query.province || ""; // Filter by province
    const district = req.query.district || ""; // Filter by district
    const faculty = req.query.faculty || ""; // Filter by target faculty
    const subject = req.query.subject || ""; // Filter by target subject

    // Pagination: default page=1, limit=10, max limit=50
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // ------------------------------
    // 2️⃣ If search includes institution name, fetch matching institution IDs
    // ------------------------------
    let institutionIds = [];
    if (search) {
      // Find institutions where name matches the search text (case-insensitive)
      const institutions = await InstitutionProfile.find({
        name: { $regex: search, $options: "i" },
      }).select("_id"); // Only get _id, not full document

      // Map institutions to array of IDs
      institutionIds = institutions.map((inst) => inst._id);
    }

    // ------------------------------
    // 3️⃣ Build dynamic MongoDB filter object
    // ------------------------------
    const filter = {};

    if (search) {
      // $or allows matching any of the fields
      filter.$or = [
        // Match scholarship title
        { scholarshipTitle: { $regex: search, $options: "i" } },

        // Match coverage type (nested object)
        { "coverage.scholarshipType": { $regex: search, $options: "i" } },

        // Match subject (nested in eligibilityCriteria)
        { "eligibilityCriteria.subject": { $regex: search, $options: "i" } },

        // Match target faculty
        {
          "eligibilityCriteria.targetFaculty": {
            $regex: search,
            $options: "i",
          },
        },

        // Match institution IDs if any found
        ...(institutionIds.length
          ? [{ institution: { $in: institutionIds } }]
          : []),
      ];
    }

    // ------------------------------
    // 4️⃣ Apply additional optional filters
    // ------------------------------
    if (province) filter["eligibilityCriteria.location.province"] = province;
    if (district) filter["eligibilityCriteria.location.district"] = district;
    if (faculty) filter["eligibilityCriteria.targetFaculty"] = faculty;
    if (subject) filter["eligibilityCriteria.subject"] = subject;

    // ------------------------------
    // 5️⃣ Count total documents for pagination info
    // ------------------------------
    const total = await Scholarship.countDocuments(filter);

    // ------------------------------
    // 6️⃣ Fetch scholarships based on filter with pagination
    // ------------------------------
    const scholarships = await Scholarship.find(filter)
      .populate("institution", "name location") // Include institution name & location in results
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip((page - 1) * limit) // Skip documents for previous pages
      .limit(limit); // Limit results per page

    // ------------------------------
    // 7️⃣ Return results to client
    // ------------------------------
    return res.status(200).json({
      total, // Total scholarships found
      page, // Current page number
      totalPages: Math.ceil(total / limit), // Total number of pages
      count: scholarships.length, // Number of scholarships returned in this page
      scholarships, // Array of scholarship documents
    });
  } catch (error) {
    // ------------------------------
    // 8️⃣ Error handling
    // ------------------------------
    console.error(error);
    return res.status(500).json({
      message: "Error fetching scholarships",
    });
  }
};
