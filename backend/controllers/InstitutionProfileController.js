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
      "name email role"
    );

    res.json({ message: "Profile updated.", institution: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/institution/verify/:institutionId  (admin only)
export const verifyInstitution = async (req, res) => {
  try {
    const { status, remarks } = req.body;

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
    institution.verification.remarks =
      status === "rejected" ? remarks || "No reason given." : null;

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