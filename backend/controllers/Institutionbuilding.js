import InstitutionProfile from "../models/InstitutionProfile.js";
import Application from "../models/Application.js";

// Get all institutions (public)
export const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await InstitutionProfile
      .find()
      .populate("user", "name email");

    res.json({ institutions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get institution data for logged-in user (protected)
export const getInstitutionData = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email");

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Send full institution data; can customize to send only required fields
    res.json({ institution });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get application data related to logged-in institution (protected)
export const getApplicationData = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const application = await Application.findOne({
      institution: institution._id,
    }).populate("student"); // populate student info

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};