import InstitutionProfile from "../models/InstitutionProfile.js";

export const getInstitutionDashboard = async (req, res) => {
  try {
    const insititution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email");

    if (!insititution) {
      return res.status(404).json({ message: "Institution not found" });
    }
    res.json(insititution);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
