import StudentProfile from "../models/StudentProfile.js";

// GET /api/student/dashboard-student
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email role");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }


    res.json(student.toObject({ virtuals: false }));
  } catch (error) {
    console.error("getStudentDashboard error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
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