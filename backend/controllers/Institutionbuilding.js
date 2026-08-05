import InstitutionProfile from "../models/InstitutionProfile.js";

// GET /api/instituionall/all-institution
export const getInstitutionData = async (req, res) => {
  try {
    const institutions = await InstitutionProfile.find({
      isDeleted: { $ne: true },
      "verification.status": "verified",
    })
      .populate("user", "name email")
      .select(
        "institutionName institutionType location contactPerson website establishedYear description courses logo"
      )
      .sort({ institutionName: 1 })
      .lean();

    res.json({ institutions });
  } catch (error) {
    console.error("getInstitutionData error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/instituionall/:id — public single-institution profile page
export const getInstitutionById = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
      "verification.status": "verified",
    })
      .populate("user", "name email avatar")
      .lean();

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    res.json({ institution });
  } catch (error) {
    // Invalid ObjectId format lands here too — treat as not found rather than 500
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Institution not found." });
    }
    console.error("getInstitutionById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};