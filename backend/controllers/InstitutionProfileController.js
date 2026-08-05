import fs from "fs";
import path from "path";
import InstitutionProfile from "../models/InstitutionProfile.js";

// GET /api/institution/dashboard-institution
export const getInstitutionDashboard = async (req, res) => {
  try {

    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email role avatar");

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    res.json(institution);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// PUT /api/institution/complete-profile — Step 3 of the stepwise Google signup.
// Called once, right after a fresh Google login for a new institution whose
// stub profile (created during google-login with just affiliatedUniversity +
// institutionType) hasn't been filled in yet. Sets profileCompleted = true on
// success so the dashboard/login redirect logic stops sending the institution
// back here.
export const completeInstitutionProfile = async (req, res) => {
  try {
    const {
      institutionName,
      institutionType,
      establishedYear,
      website,
      description,
      location,
      contactPerson,
    } = req.body;

    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    if (!institutionName || !institutionName.trim()) {
      return res.status(400).json({ message: "Institution name is required." });
    }
    if (!location?.province || !location?.district) {
      return res
        .status(400)
        .json({ message: "Province and district are required." });
    }

    institution.institutionName = institutionName.trim();
    // institutionType may already be set from Step 1 (Google signup) — allow
    // overriding here since the full form shows it again for confirmation.
    if (institutionType) institution.institutionType = institutionType;
    if (establishedYear !== undefined) institution.establishedYear = establishedYear;
    if (website !== undefined) institution.website = website;
    if (description !== undefined) institution.description = description;

    institution.location.province = location.province;
    institution.location.district = location.district;
    institution.location.municipality = location.municipality ?? institution.location.municipality;
    institution.location.ward = location.ward ?? institution.location.ward;
    institution.location.street = location.street ?? institution.location.street;

    if (contactPerson) {
      institution.contactPerson.name = contactPerson.name ?? institution.contactPerson.name;
      institution.contactPerson.phone = contactPerson.phone ?? institution.contactPerson.phone;
      institution.contactPerson.email = contactPerson.email ?? institution.contactPerson.email;
      institution.contactPerson.designation =
        contactPerson.designation ?? institution.contactPerson.designation;
    }

    institution.profileCompleted = true;

    await institution.save();

    const updated = await InstitutionProfile.findById(institution._id).populate(
      "user",
      "name email role"
    );

    res.json({ message: "Profile completed.", institution: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/institution/profile — edit own institution profile (after signup)
export const updateInstitutionProfile = async (req, res) => {
  try {
    const {
      institutionName,
      institutionType,
      affiliatedUniversity,
      establishedYear,
      website,
      description,
      location,
      contactPerson,
    } = req.body;

    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    if (institutionName !== undefined) institution.institutionName = institutionName;
    if (institutionType !== undefined) institution.institutionType = institutionType;
    if (affiliatedUniversity !== undefined) institution.affiliatedUniversity = affiliatedUniversity;
    if (establishedYear !== undefined) institution.establishedYear = establishedYear;
    if (website !== undefined) institution.website = website;
    if (description !== undefined) institution.description = description;

    if (location) {
      institution.location.province = location.province ?? institution.location.province;
      institution.location.district = location.district ?? institution.location.district;
      institution.location.municipality =
        location.municipality ?? institution.location.municipality;
      institution.location.ward = location.ward ?? institution.location.ward;
      institution.location.street = location.street ?? institution.location.street;
    }

    if (contactPerson) {
      institution.contactPerson.name = contactPerson.name ?? institution.contactPerson.name;
      institution.contactPerson.phone = contactPerson.phone ?? institution.contactPerson.phone;
      institution.contactPerson.email = contactPerson.email ?? institution.contactPerson.email;
      institution.contactPerson.designation =
        contactPerson.designation ?? institution.contactPerson.designation;
    }

    await institution.save();

    const updated = await InstitutionProfile.findById(institution._id).populate(
      "user",
      "name email role avatar"
    );

    res.json({ message: "Profile updated.", institution: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/institution/logo  (multipart/form-data, field name: "logo")
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file received." });
    }

    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).select("+logoPath");

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // Best-effort delete of the previous logo file so disk doesn't fill up
    if (institution.logoPath) {
      fs.unlink(institution.logoPath, () => {});
    }

    const relativePath = path
      .join("uploads", "institution-logos", req.user.id, req.file.filename)
      .replace(/\\/g, "/");

    institution.logoPath = relativePath;
    institution.logo = `${req.protocol}://${req.get("host")}/${relativePath}`;
    await institution.save();

    res.json({ message: "Institution logo updated.", logo: institution.logo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/institution/logo
export const deleteLogo = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).select("+logoPath");

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    if (institution.logoPath) {
      fs.unlink(institution.logoPath, () => {});
    }

    institution.logo = null;
    institution.logoPath = null;
    await institution.save();

    res.json({ message: "Institution logo removed.", logo: null });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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