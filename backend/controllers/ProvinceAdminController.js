import InstitutionProfile from "../models/InstitutionProfile.js";
import Scholarship from "../models/Scholarship.js";
import ProvinceAdminProfile from "../models/ProvinceAdminProfile.js";

// Helper function to get the current Province Admin's assigned province
const getAdminProvinceId = async (userId) => {
  const profile = await ProvinceAdminProfile.findOne({ user: userId });
  if (!profile) throw new Error("Province Admin profile not found.");
  if (!profile.isActive) throw new Error("Province Admin account is deactivated.");
  return profile.assignedProvince;
};

// GET /api/province-admin/institutions
export const getInstitutionsInProvince = async (req, res) => {
  try {
    const provinceId = await getAdminProvinceId(req.user.id);

    const institutions = await InstitutionProfile.find({
      "location.provinceRef.provinceId": provinceId,
    }).populate("user", "name email isVerified");

    res.json(institutions);
  } catch (error) {
    console.error("getInstitutionsInProvince error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// PATCH /api/province-admin/institutions/:id/verify
export const verifyInstitution = async (req, res) => {
  try {
    const provinceId = await getAdminProvinceId(req.user.id);
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const institution = await InstitutionProfile.findById(id);

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // Security check: Ensure the institution is in the admin's province
    if (institution.location?.provinceRef?.provinceId?.toString() !== provinceId.toString()) {
      return res.status(403).json({ message: "You do not have permission to verify this institution." });
    }

    institution.verification = {
      status,
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      remarks: remarks || "",
    };

    // Force save hooks to run so isApproved syncs
    await institution.save();

    res.json({ message: `Institution ${status} successfully.`, institution });
  } catch (error) {
    console.error("verifyInstitution error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// GET /api/province-admin/scholarships
export const getScholarshipsInProvince = async (req, res) => {
  try {
    const provinceId = await getAdminProvinceId(req.user.id);

    // Find all institutions in this province
    const institutions = await InstitutionProfile.find({
      "location.provinceRef.provinceId": provinceId,
    }).select("_id");

    const institutionIds = institutions.map((inst) => inst._id);

    // Find all scholarships posted by those institutions
    const scholarships = await Scholarship.find({
      institutionId: { $in: institutionIds },
      isDeleted: false,
    }).populate({
      path: "institutionId",
      select: "institutionName location.province",
    });

    res.json(scholarships);
  } catch (error) {
    console.error("getScholarshipsInProvince error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// PATCH /api/province-admin/scholarships/:id/verify
export const verifyScholarship = async (req, res) => {
  try {
    const provinceId = await getAdminProvinceId(req.user.id);
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!["approved", "rejected", "revision_requested"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const scholarship = await Scholarship.findById(id).populate("institutionId");

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found." });
    }

    // Security check: Ensure the scholarship's institution is in the admin's province
    if (scholarship.institutionId?.location?.provinceRef?.provinceId?.toString() !== provinceId.toString()) {
      return res.status(403).json({ message: "You do not have permission to verify this scholarship." });
    }

    scholarship.verification = {
      status,
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      remarks: remarks || "",
    };

    await scholarship.save();

    res.json({ message: `Scholarship ${status} successfully.`, scholarship });
  } catch (error) {
    console.error("verifyScholarship error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
