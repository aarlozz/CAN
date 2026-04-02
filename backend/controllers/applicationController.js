import mongoose from "mongoose";
import ScholarshipApplication from "../models/ScholarshipApplication.js";
import Scholarship from "../models/Scholarship.js";
import StudentProfile from "../models/StudentProfile.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import User from "../models/User.js";

// Helper — builds the student snapshot frozen at apply time
const buildSnapshot = (student, user) => ({
  fullName:    user.name,
  gender:      student.personal_info?.gender  || "",
  dateOfBirth: student.personal_info?.dob     || null,
  phone:       student.personal_info?.phone   || "",
  email:       user.email,
  location: {
    province:     student.address?.province     || "",
    district:     student.address?.district     || "",
    municipality: student.address?.municipality || "",
    addressLine:  student.address?.street       || "",
  },
  educationInfo: {
    schoolName:            student.educationInfo?.schoolName            || "",
    schoolType:            student.educationInfo?.schoolType            || "",
    currentEducationLevel: student.educationInfo?.currentEducationLevel || "",
  },
  reservationInfo: {
    caste:          student.reservationInfo?.caste          || "",
    hasDisability:  student.reservationInfo?.hasDisability  || false,
    disabilityType: student.reservationInfo?.disabilityType || "",
  },
  guardianInfo: {
    name:     student.guardian_info?.name         || "",
    phone:    student.guardian_info?.phone_number || "",
    relation: student.guardian_info?.relation     || "",
  },
  snapshotCreatedAt: new Date(),
});

// POST /api/application/apply  (student only)
export const applyForScholarship = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scholarshipId, applicationType, meritDetails, reservationDetails, documents } = req.body;

    if (!scholarshipId || !applicationType) {
      await session.abortTransaction();
      return res.status(400).json({ message: "scholarshipId and applicationType are required." });
    }

    const scholarship = await Scholarship.findOne({
      _id: scholarshipId,
      isActive: true,
      isDeleted: false,
      applicationDeadline: { $gte: new Date() },
    }).session(session);

    if (!scholarship) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Scholarship not found or deadline has passed." });
    }

    if (scholarship.scholarshipType !== "both" && scholarship.scholarshipType !== applicationType) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `This scholarship only accepts "${scholarship.scholarshipType}" applications.`,
      });
    }

    if (scholarship.financialDetails?.availableSlots !== undefined &&
        scholarship.financialDetails.availableSlots <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No available slots remaining." });
    }

    // ── FIX: removed isDeleted: false ────────────────────────────────────────
    const student = await StudentProfile.findOne({ user: req.user.id }).session(session);

    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Student profile not found." });
    }

    const user = await User.findById(req.user.id).session(session);

    const duplicate = await ScholarshipApplication.findOne({
      scholarshipId,
      studentId: student._id,
    }).session(session);

    if (duplicate) {
      await session.abortTransaction();
      return res.status(400).json({ message: "You have already applied for this scholarship." });
    }

    const [application] = await ScholarshipApplication.create(
      [{
        scholarshipId,
        studentId: student._id,
        applicationType,
        studentSnapshot: buildSnapshot(student, user),
        meritDetails:       applicationType === "merit"       ? meritDetails       : undefined,
        reservationDetails: applicationType === "reservation" ? reservationDetails : undefined,
        documents: documents || [],
      }],
      { session }
    );

    await Scholarship.findByIdAndUpdate(
      scholarshipId,
      { $inc: {
        "statistics.totalApplications":    1,
        "statistics.pendingApplications":  1,
        "financialDetails.availableSlots": -1,
      }},
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: "Application submitted successfully.", application });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied for this scholarship." });
    }
    console.error("applyForScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// GET /api/application/my  (student)
export const getMyApplications = async (req, res) => {
  try {
    // ── FIX: removed isDeleted: false ────────────────────────────────────────
    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const applications = await ScholarshipApplication.find({ studentId: student._id })
      .populate("scholarshipId", "scholarshipTitle applicationDeadline financialDetails institutionName")
      .sort({ appliedAt: -1 });

    res.json({ count: applications.length, applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/application/institution  (institution)
export const getInstitutionApplications = async (req, res) => {
  try {
    // ── FIX: removed isDeleted: false ────────────────────────────────────────
    const institution = await InstitutionProfile.findOne({ user: req.user.id });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const scholarships = await Scholarship.find({
      institutionId: institution._id,
      isDeleted: false,
    }).select("_id");

    const scholarshipIds = scholarships.map((s) => s._id);
    const { scholarshipId, status, page = 1, limit = 20 } = req.query;

    const filter = { scholarshipId: { $in: scholarshipIds } };
    if (scholarshipId) filter.scholarshipId = scholarshipId;
    if (status)        filter.applicationStatus = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      ScholarshipApplication.find(filter)
        .populate("scholarshipId", "scholarshipTitle")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ScholarshipApplication.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), pages: Math.ceil(total / Number(limit)), applications });
  } catch (error) {
    console.error("getInstitutionApplications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/application/:id  (student or institution)
export const getApplicationById = async (req, res) => {
  try {
    const application = await ScholarshipApplication.findById(req.params.id)
      .populate("scholarshipId", "scholarshipTitle applicationDeadline financialDetails institutionName scholarshipType");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (req.user.role === "student") {
      // ── FIX: removed isDeleted: false ──────────────────────────────────────
      const student = await StudentProfile.findOne({ user: req.user.id });
      if (!student || application.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    if (req.user.role === "institution") {
      // ── FIX: removed isDeleted: false ──────────────────────────────────────
      const institution = await InstitutionProfile.findOne({ user: req.user.id });
      const scholarship  = await Scholarship.findById(application.scholarshipId);
      if (!institution || !scholarship ||
          scholarship.institutionId.toString() !== institution._id.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    res.json({ application });
  } catch (error) {
    console.error("getApplicationById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/application/:id/review  (institution)
export const reviewApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, rejectionReason, internalNotes } = req.body;
    const validTransitions = ["under_review", "approved", "rejected"];

    if (!validTransitions.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: `status must be: ${validTransitions.join(", ")}` });
    }

    // ── FIX: removed isDeleted: false ────────────────────────────────────────
    const institution = await InstitutionProfile.findOne({ user: req.user.id }).session(session);

    if (!institution) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Institution not found." });
    }

    const application = await ScholarshipApplication.findById(req.params.id).session(session);

    if (!application) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Application not found." });
    }

    const scholarship = await Scholarship.findOne({
      _id: application.scholarshipId,
      institutionId: institution._id,
    }).session(session);

    if (!scholarship) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Access denied." });
    }

    const previousStatus = application.applicationStatus;
    application.applicationStatus      = status;
    application.review.reviewedBy      = req.user.id;
    application.review.reviewedAt      = new Date();
    application.review.rejectionReason = rejectionReason || null;
    application.review.internalNotes   = internalNotes   || null;
    await application.save({ session });

    const statsUpdate = {};
    if (previousStatus === "pending" && status === "under_review") {
      statsUpdate["statistics.pendingApplications"] = -1;
    }
    if (status === "approved") {
      statsUpdate["statistics.approvedApplications"] = 1;
      if (previousStatus === "pending") statsUpdate["statistics.pendingApplications"] = -1;
    }
    if (status === "rejected") {
      statsUpdate["financialDetails.availableSlots"] = 1;
      if (previousStatus === "pending") statsUpdate["statistics.pendingApplications"] = -1;
    }

    if (Object.keys(statsUpdate).length > 0) {
      await Scholarship.findByIdAndUpdate(scholarship._id, { $inc: statsUpdate }, { session });
    }

    await session.commitTransaction();
    res.json({ message: `Application ${status}.`, application });
  } catch (error) {
    await session.abortTransaction();
    console.error("reviewApplication error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// PATCH /api/application/:id/withdraw  (student)
export const withdrawApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    const student = await StudentProfile.findOne({ user: req.user.id }).session(session);

    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Student profile not found." });
    }

    const application = await ScholarshipApplication.findOne({
      _id: req.params.id,
      studentId: student._id,
    }).session(session);

    if (!application) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Application not found." });
    }

    if (["approved", "rejected", "withdrawn"].includes(application.applicationStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot withdraw an application that is already "${application.applicationStatus}".`,
      });
    }

    const previousStatus = application.applicationStatus;
    application.applicationStatus = "withdrawn";
    await application.save({ session });

    const statsUpdate = { "financialDetails.availableSlots": 1 };
    if (previousStatus === "pending") statsUpdate["statistics.pendingApplications"] = -1;

    await Scholarship.findByIdAndUpdate(application.scholarshipId, { $inc: statsUpdate }, { session });

    await session.commitTransaction();
    res.json({ message: "Application withdrawn successfully." });
  } catch (error) {
    await session.abortTransaction();
    console.error("withdrawApplication error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};
