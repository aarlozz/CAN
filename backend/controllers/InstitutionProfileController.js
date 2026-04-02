import InstitutionProfile from "../models/InstitutionProfile.js";

// GET /api/institution/dashboard-institution
export const getInstitutionDashboard = async (req, res) => {
  try {
    
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email role");

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    res.json(institution);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/institution/courses
export const addCourse = async (req, res) => {
  try {
    const { courseName, courseLevel, duration, description } = req.body;

    if (!courseName || !courseLevel) {
      return res
        .status(400)
        .json({ message: "courseName and courseLevel are required." });
    }

    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    institution.courses.push({ courseName, courseLevel, duration, description });
    await institution.save();

    res.status(201).json({
      message: "Course added.",
      courses: institution.courses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/institution/courses/:courseId
export const removeCourse = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const idx = institution.courses.findIndex(
      (c) => c._id.toString() === req.params.courseId
    );

    if (idx === -1) {
      return res.status(404).json({ message: "Course not found." });
    }

    institution.courses.splice(idx, 1);
    await institution.save();

    res.json({ message: "Course removed.", courses: institution.courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/institution/verify/:institutionId  (admin only)
export const verifyInstitution = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be 'verified' or 'rejected'." });
    }

    const institution = await InstitutionProfile.findById(
      req.params.institutionId
    );

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    institution.verification.status     = status;
    institution.verification.verifiedBy = req.user.id;
    institution.verification.verifiedAt = new Date();
    institution.verification.rejectionReason =
      status === "rejected" ? rejectionReason || "No reason given." : null;

    await institution.save();

    res.json({
      message: `Institution ${status}.`,
      verification: institution.verification,
      isApproved: institution.isApproved,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};