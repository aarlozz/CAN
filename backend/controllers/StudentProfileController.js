import StudentProfile from "../models/StudentProfile.js";
import ScholarshipApplication from "../models/ScholarshipApplication.js";
// GET /api/student/dashboard-student
export const getStudentDashboard = async (req, res) => {
  try {
    console.log("JWT User:");
    console.log(req.user);

      const student = await StudentProfile.findOne({
    user: req.user.id,
}).populate("user", "name email role avatar");


    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }


    res.json(student.toObject({ virtuals: false }));
  } catch (error) {
    console.error("getStudentDashboard error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
// GET /api/student/my-applications
export const getStudentApplications = async (req, res) => {
  try {
    // 1. Find student profile
    const student = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    // 2. Fetch applications
    const applications = await ScholarshipApplication.find({
      studentId: student._id,
    })
      .populate({
        path: "scholarshipId",
        select: "scholarshipTitle institutionName",
      })
      .sort({ createdAt: -1 });

    // 3. Format for frontend
    const formattedApplications = applications.map((app) => ({
      _id: app._id,
      scholarshipName: app.scholarshipId?.scholarshipTitle || "N/A",
      institutionName: app.scholarshipId?.institutionName || "N/A",
      status: app.applicationStatus,
      appliedAt: app.appliedAt,
    }));

    return res.status(200).json(formattedApplications);

  } catch (error) {
    console.error("getStudentApplications error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// PATCH /api/student/education
export const updateEducation = async (req, res) => {
  try {
    const { schoolName, schoolType, currentEducationLevel } = req.body;

    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    student.educationInfo = {
      schoolName:            schoolName            ?? student.educationInfo?.schoolName,
      schoolType:            schoolType            ?? student.educationInfo?.schoolType,
      currentEducationLevel: currentEducationLevel ?? student.educationInfo?.currentEducationLevel,
    };

    student.profileCompleted = !!(
      student.personal_info?.dob &&
      student.address?.province &&
      student.guardian_info?.name &&
      student.educationInfo?.schoolName
    );

    await student.save();

    res.json({
      message: "Education info updated.",
      educationInfo: student.educationInfo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/student/reservation
export const updateReservation = async (req, res) => {
  try {
    const { caste, hasDisability, disabilityType } = req.body;

    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    student.reservationInfo = {
      caste:          caste          ?? student.reservationInfo?.caste,
      hasDisability:  hasDisability  ?? student.reservationInfo?.hasDisability,
      disabilityType: disabilityType ?? student.reservationInfo?.disabilityType,
    };

    await student.save();

    res.json({
      message: "Reservation info updated.",
      reservationInfo: student.reservationInfo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/student/documents
export const addDocument = async (req, res) => {
  try {
    const { documentType, documentTitle, filePath, fileName, fileSize, mimeType } =
      req.body;

    if (!documentType || !filePath) {
      return res
        .status(400)
        .json({ message: "documentType and filePath are required." });
    }

    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    student.documents.push({
      documentType,
      documentTitle,
      filePath,
      fileName,
      fileSize,
      mimeType,
    });

    await student.save();

    res.status(201).json({
      message: "Document added.",
      documents: student.documents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/student/documents/:docId
export const removeDocument = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const idx = student.documents.findIndex(
      (d) => d._id.toString() === req.params.docId
    );

    if (idx === -1) {
      return res.status(404).json({ message: "Document not found." });
    }

    student.documents.splice(idx, 1);
    await student.save();

    res.json({ message: "Document removed.", documents: student.documents });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/student/complete-profile
export const completeProfile = async (req, res) => {
  try {
    const {
      personal_info,
      address,
      guardian_info,
      educationInfo,
      reservationInfo,
    } = req.body;

    const student = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    // Update profile
    student.personal_info = personal_info;
    student.address = address;
    student.guardian_info = guardian_info;
    student.educationInfo = educationInfo;
    student.reservationInfo = reservationInfo;

    // Mark profile completed
    student.profileCompleted = true;

    await student.save();

    res.status(200).json({
      message: "Profile completed successfully.",
      profile: student,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
};