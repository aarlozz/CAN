import InstitutionProfile from "../models/InstitutionProfile.js";

export const getInstitutionData = async (req, res) => {
  try {

    const institutions = await InstitutionProfile.find({
      isDeleted: { $ne: true },
      "verification.status": "verified",
    })
      .populate("user", "name email")
      .select(
        "institutionName institutionType location contactPerson website establishedYear description"
      )
      .sort({ institutionName: 1 })
      .lean();

    res.json({ institutions });
  } catch (error) {
    console.error("getInstitutionData error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};