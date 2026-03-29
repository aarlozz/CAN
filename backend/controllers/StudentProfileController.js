import StudentProfile from "../models/StudentProfile.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json(student);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};