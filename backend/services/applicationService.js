import mongoose from "mongoose";
import ScholarshipApplication from "../models/ScholarshipApplication.js";
import Scholarship from "../models/Scholarship.js";
import StudentProfile from "../models/StudentProfile.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notificationHelper.js";
import { AppError } from "../utils/AppError.js";

// Escapes regex special characters for free-text search/filter safety
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Builds the student snapshot frozen at application time.
 * Supports both flat string location and Ref location objects.
 */
export const buildSnapshot = (student, user) => ({
  fullName: user.name,
  gender: student.personal_info?.gender || "",
  dateOfBirth: student.personal_info?.dob || null,
  phone: student.personal_info?.phone || "",
  email: user.email,
  location: {
    province:
      student.address?.province ||
      student.address?.provinceRef?.provinceName ||
      "",
    district:
      student.address?.district ||
      student.address?.districtRef?.districtName ||
      "",
    municipality:
      student.address?.municipality ||
      student.address?.municipalityRef?.municipalityName ||
      "",
    addressLine: student.address?.street || "",
  },
  educationInfo: {
    schoolName: student.educationInfo?.schoolName || "",
    schoolType: student.educationInfo?.schoolType || "",
    currentEducationLevel: student.educationInfo?.currentEducationLevel || "",
  },
  reservationInfo: {
    caste: student.reservationInfo?.caste || "",
    hasDisability: student.reservationInfo?.hasDisability || false,
    disabilityType: student.reservationInfo?.disabilityType || "",
  },
  guardianInfo: {
    name: student.guardian_info?.name || "",
    phone: student.guardian_info?.phone_number || "",
    relation: student.guardian_info?.relation || "",
  },
  snapshotCreatedAt: new Date(),
});

// ─── Service Methods ──────────────────────────────────────────────────────────

export const applyForScholarship = async ({ userId, body }) => {
  const {
    scholarshipId,
    applicationType,
    meritDetails,
    reservationDetails,
    documents,
  } = body;

  if (!scholarshipId || !applicationType) {
    throw new AppError("scholarshipId and applicationType are required.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const scholarship = await Scholarship.findOne({
      _id: scholarshipId,
      isActive: true,
      isDeleted: false,
      applicationDeadline: { $gte: new Date() },
    }).session(session);

    if (!scholarship) {
      throw new AppError("Scholarship not found or deadline has passed.", 404);
    }

    const schType = scholarship.coverage?.scholarshipType2;
    const MERIT_TYPES = ["merit_based"];
    const RESERVATION_TYPES = ["disability", "gender", "ethnic"];

    if (
      applicationType === "merit" &&
      schType &&
      RESERVATION_TYPES.includes(schType)
    ) {
      throw new AppError(
        "This scholarship only accepts reservation-type applications.",
        400
      );
    }

    if (
      applicationType === "reservation" &&
      schType &&
      MERIT_TYPES.includes(schType)
    ) {
      throw new AppError(
        "This scholarship only accepts merit-type applications.",
        400
      );
    }

    if (
      scholarship.remainingSeats !== undefined &&
      scholarship.remainingSeats !== null &&
      scholarship.remainingSeats <= 0
    ) {
      throw new AppError("No available seats remaining.", 400);
    }

    const student = await StudentProfile.findOne({ user: userId }).session(
      session
    );

    if (!student) {
      throw new AppError("Student profile not found.", 404);
    }

    const user = await User.findById(userId).session(session);

    const duplicate = await ScholarshipApplication.findOne({
      scholarshipId,
      studentId: student._id,
    }).session(session);

    if (duplicate) {
      throw new AppError("You have already applied for this scholarship.", 400);
    }

    const [application] = await ScholarshipApplication.create(
      [
        {
          scholarshipId,
          studentId: student._id,
          applicationType,
          studentSnapshot: buildSnapshot(student, user),
          meritDetails: applicationType === "merit" ? meritDetails : undefined,
          reservationDetails:
            applicationType === "reservation" ? reservationDetails : undefined,
          documents: documents || [],
        },
      ],
      { session }
    );

    await Scholarship.findByIdAndUpdate(
      scholarshipId,
      {
        $inc: {
          "statistics.totalApplications": 1,
          "statistics.pendingApplications": 1,
          remainingSeats: -1,
        },
      },
      { session }
    );

    await session.commitTransaction();
    return application;
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      throw new AppError("You have already applied for this scholarship.", 400);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const getMyApplications = async (userId) => {
  const student = await StudentProfile.findOne({ user: userId });
  if (!student) {
    throw new AppError("Student profile not found.", 404);
  }

  const applications = await ScholarshipApplication.find({
    studentId: student._id,
  })
    .populate(
      "scholarshipId",
      "scholarshipTitle applicationDeadline financialDetails institutionName coverage remainingSeats"
    )
    .sort({ appliedAt: -1 });

  return { count: applications.length, applications };
};

export const getInstitutionApplications = async ({ userId, query }) => {
  const institution = await InstitutionProfile.findOne({ user: userId });
  if (!institution) {
    throw new AppError("Institution not found.", 404);
  }

  const ownScholarships = await Scholarship.find({
    institutionId: institution._id,
    isDeleted: false,
  }).select("_id");
  const scholarshipIds = ownScholarships.map((s) => s._id);

  const {
    scholarshipId,
    status,
    applicationType,
    gender,
    hasDisability,
    ethnicCategory,
    province,
    district,
    municipality,
    scholarshipType,
    minAmount,
    maxAmount,
    minFee,
    maxFee,
    fromDate,
    toDate,
    search,
    page = 1,
    limit = 20,
  } = query;

  const match = { scholarshipId: { $in: scholarshipIds } };
  if (scholarshipId)
    match.scholarshipId = new mongoose.Types.ObjectId(scholarshipId);
  if (status) match.applicationStatus = status;
  if (applicationType) match.applicationType = applicationType;

  if (gender) {
    match["studentSnapshot.gender"] = {
      $regex: `^${escapeRegex(gender)}$`,
      $options: "i",
    };
  }
  if (hasDisability !== undefined) {
    match["studentSnapshot.reservationInfo.hasDisability"] =
      hasDisability === "true";
  }
  if (ethnicCategory) {
    match["studentSnapshot.reservationInfo.caste"] = {
      $regex: `^${escapeRegex(ethnicCategory)}$`,
      $options: "i",
    };
  }

  if (province) {
    let provinceName = province.trim().replace(/\s+Province$/i, "");
    match["studentSnapshot.location.province"] = {
      $regex: `^${escapeRegex(provinceName)}( Province)?$`,
      $options: "i",
    };
  }

  if (district) {
    match["studentSnapshot.location.district"] = {
      $regex: `^${escapeRegex(district.trim())}$`,
      $options: "i",
    };
  }

  if (municipality) {
    match["studentSnapshot.location.municipality"] = {
      $regex: `^${escapeRegex(municipality.trim())}$`,
      $options: "i",
    };
  }
  if (search) {
    match["studentSnapshot.fullName"] = {
      $regex: escapeRegex(search),
      $options: "i",
    };
  }
  if (fromDate || toDate) {
    match.appliedAt = {};
    if (fromDate) match.appliedAt.$gte = new Date(fromDate);
    if (toDate) match.appliedAt.$lte = new Date(toDate);
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "scholarships",
        localField: "scholarshipId",
        foreignField: "_id",
        as: "scholarship",
      },
    },
    { $unwind: "$scholarship" },
  ];

  const scholarshipMatch = {};
  if (scholarshipType) {
    scholarshipMatch["scholarship.coverage.scholarshipType2"] = scholarshipType;
  }
  if (minAmount || maxAmount) {
    scholarshipMatch["scholarship.coverage.amountNpr"] = {};
    if (minAmount)
      scholarshipMatch["scholarship.coverage.amountNpr"].$gte = Number(minAmount);
    if (maxAmount)
      scholarshipMatch["scholarship.coverage.amountNpr"].$lte = Number(maxAmount);
  }
  if (minFee || maxFee) {
    scholarshipMatch["scholarship.coverage.totalProgramFeeNpr"] = {};
    if (minFee)
      scholarshipMatch["scholarship.coverage.totalProgramFeeNpr"].$gte =
        Number(minFee);
    if (maxFee)
      scholarshipMatch["scholarship.coverage.totalProgramFeeNpr"].$lte =
        Number(maxFee);
  }
  if (Object.keys(scholarshipMatch).length) {
    pipeline.push({ $match: scholarshipMatch });
  }

  pipeline.push({ $sort: { appliedAt: -1 } });

  const countPipeline = [...pipeline, { $count: "total" }];

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  pipeline.push(
    { $skip: skip },
    { $limit: limitNum },
    {
      $project: {
        applicationType: 1,
        applicationStatus: 1,
        studentSnapshot: 1,
        meritDetails: 1,
        reservationDetails: 1,
        documents: 1,
        appliedAt: 1,
        review: 1,
        "scholarship._id": 1,
        "scholarship.scholarshipTitle": 1,
        "scholarship.coverage": 1,
        "scholarship.applicationDeadline": 1,
      },
    }
  );

  const [applications, countResult] = await Promise.all([
    ScholarshipApplication.aggregate(pipeline),
    ScholarshipApplication.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    applications,
  };
};

export const getApplicationById = async ({ userId, role, id }) => {
  const application = await ScholarshipApplication.findById(id).populate(
    "scholarshipId",
    "scholarshipTitle applicationDeadline financialDetails institutionName scholarshipType coverage"
  );

  if (!application) {
    throw new AppError("Application not found.", 404);
  }

  if (role === "student") {
    const student = await StudentProfile.findOne({ user: userId });
    if (!student || application.studentId.toString() !== student._id.toString()) {
      throw new AppError("Access denied.", 403);
    }
  }

  if (role === "institution") {
    const institution = await InstitutionProfile.findOne({ user: userId });
    const scholarship = await Scholarship.findById(application.scholarshipId);
    if (
      !institution ||
      !scholarship ||
      scholarship.institutionId.toString() !== institution._id.toString()
    ) {
      throw new AppError("Access denied.", 403);
    }
  }

  return application;
};

export const reviewApplication = async ({
  userId,
  id,
  status,
  rejectionReason,
  internalNotes,
}) => {
  const validTransitions = ["under_review", "approved", "rejected"];
  if (!validTransitions.includes(status)) {
    throw new AppError(`status must be: ${validTransitions.join(", ")}`, 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const institution = await InstitutionProfile.findOne({
      user: userId,
    }).session(session);

    if (!institution) {
      throw new AppError("Institution not found.", 404);
    }

    const application = await ScholarshipApplication.findById(id).session(
      session
    );

    if (!application) {
      throw new AppError("Application not found.", 404);
    }

    const scholarship = await Scholarship.findOne({
      _id: application.scholarshipId,
      institutionId: institution._id,
    }).session(session);

    if (!scholarship) {
      throw new AppError("Access denied.", 403);
    }

    const previousStatus = application.applicationStatus;
    application.applicationStatus = status;
    application.review.reviewedBy = userId;
    application.review.reviewedAt = new Date();
    application.review.rejectionReason = rejectionReason || null;
    application.review.internalNotes = internalNotes || null;
    await application.save({ session });

    const statsUpdate = {};
    if (previousStatus === "pending" && status === "under_review") {
      statsUpdate["statistics.pendingApplications"] = -1;
    }
    if (status === "approved") {
      statsUpdate["statistics.approvedApplications"] = 1;
      if (previousStatus === "pending")
        statsUpdate["statistics.pendingApplications"] = -1;
    }
    if (status === "rejected") {
      statsUpdate.remainingSeats = 1;
      statsUpdate["financialDetails.availableSlots"] = 1;
      if (previousStatus === "pending")
        statsUpdate["statistics.pendingApplications"] = -1;
    }

    if (Object.keys(statsUpdate).length > 0) {
      await Scholarship.findByIdAndUpdate(
        scholarship._id,
        { $inc: statsUpdate },
        { session }
      );
    }

    await session.commitTransaction();

    // Student notification (non-blocking)
    if (["approved", "rejected", "under_review"].includes(status)) {
      StudentProfile.findById(application.studentId)
        .select("user")
        .then((studentProfile) => {
          if (!studentProfile) return;

          const NOTIFY_COPY = {
            approved: {
              title: "Your scholarship application was approved! 🎉",
              message: `Congratulations — your application to "${scholarship.scholarshipTitle}" has been approved.`,
              priority: "high",
            },
            rejected: {
              title: "Update on your scholarship application",
              message: `Your application to "${scholarship.scholarshipTitle}" was not approved this time.${
                rejectionReason ? ` Reason: ${rejectionReason}` : ""
              }`,
              priority: "high",
            },
            under_review: {
              title: "Your scholarship application is under review",
              message: `Your application to "${scholarship.scholarshipTitle}" is now under review.`,
              priority: "medium",
            },
          };
          const copy = NOTIFY_COPY[status];

          createNotification({
            userId: studentProfile.user,
            notificationType: `application_${status}`,
            title: copy.title,
            message: copy.message,
            relatedEntity: {
              entityType: "Application",
              entityId: application._id,
            },
            priority: copy.priority,
          });
        })
        .catch((err) =>
          console.warn("⚠️ Failed to look up student for notification:", err.message)
        );
    }

    return application;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const withdrawApplication = async ({ userId, id }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await StudentProfile.findOne({ user: userId }).session(
      session
    );

    if (!student) {
      throw new AppError("Student profile not found.", 404);
    }

    const application = await ScholarshipApplication.findOne({
      _id: id,
      studentId: student._id,
    }).session(session);

    if (!application) {
      throw new AppError("Application not found.", 404);
    }

    if (
      ["approved", "rejected", "withdrawn"].includes(
        application.applicationStatus
      )
    ) {
      throw new AppError(
        `Cannot withdraw an application that is already "${application.applicationStatus}".`,
        400
      );
    }

    const previousStatus = application.applicationStatus;
    application.applicationStatus = "withdrawn";
    await application.save({ session });

    const statsUpdate = {
      remainingSeats: 1,
      "financialDetails.availableSlots": 1,
    };
    if (previousStatus === "pending")
      statsUpdate["statistics.pendingApplications"] = -1;

    await Scholarship.findByIdAndUpdate(
      application.scholarshipId,
      { $inc: statsUpdate },
      { session }
    );

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
