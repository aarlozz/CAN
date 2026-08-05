import User from "../models/User.js";
import ProvinceAdminProfile from "../models/ProvinceAdminProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import InstitutionProfile from "../models/InstitutionProfile.js";
import Scholarship from "../models/Scholarship.js";
import ScholarshipApplication from "../models/ScholarshipApplication.js";
import bcrypt from "bcryptjs";

// POST /api/super-admin/province-admins
export const createProvinceAdmin = async (req, res) => {
  try {
    const { name, email, password, assignedProvince } = req.body;

    if (!name || !email || !password || !assignedProvince) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "province_admin",
        authProvider: "local",
        isVerified: true,
      });

      const profile = await ProvinceAdminProfile.create({
        user: user._id,
        assignedProvince,
        createdBy: req.user.id,
      });

      res.status(201).json({
        message: "Province Admin created successfully.",
        provinceAdmin: { user, profile },
      });
    } catch (creationError) {
      if (user && user._id) {
        await User.findByIdAndDelete(user._id); // Rollback user creation
      }
      throw creationError; // Pass to outer catch
    }
  } catch (error) {
    console.error("createProvinceAdmin error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// PATCH /api/super-admin/province-admins/:id/status
export const toggleProvinceAdminStatus = async (req, res) => {
  try {
    const { id } = req.params; // This is the ProvinceAdminProfile _id

    const profile = await ProvinceAdminProfile.findById(id).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Province Admin profile not found." });
    }

    profile.isActive = !profile.isActive;
    await profile.save();

    res.json({
      message: `Province Admin is now ${profile.isActive ? "active" : "inactive"}.`,
      profile,
    });
  } catch (error) {
    console.error("toggleProvinceAdminStatus error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/super-admin/province-admins
export const getAllProvinceAdmins = async (req, res) => {
  try {
    const admins = await ProvinceAdminProfile.find()
      .populate("user", "name email isVerified")
      .populate("assignedProvince", "provinceName")
      .populate("createdBy", "name email");

    res.json(admins);
  } catch (error) {
    console.error("getAllProvinceAdmins error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/super-admin/stats
export const getSystemStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalInstitutions = await InstitutionProfile.countDocuments();
    const totalScholarships = await Scholarship.countDocuments({ isDeleted: false });
    const totalApplications = await ScholarshipApplication.countDocuments();
    
    const adminUser = await User.findById(req.user.id).select("-password");

    res.json({
      students: totalStudents,
      institutions: totalInstitutions,
      scholarships: totalScholarships,
      applications: totalApplications,
      adminUser
    });
  } catch (error) {
    console.error("getSystemStats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/super-admin/institutions
export const getAllInstitutions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (req.query.status && req.query.status !== "all") {
      filter["verification.status"] = req.query.status;
    }
    if (req.query.provinceId && req.query.provinceId !== "all") {
      filter["location.provinceRef.provinceId"] = req.query.provinceId;
    }
    if (req.query.search) {
      filter.institutionName = { $regex: req.query.search, $options: "i" };
    }

    // Determine sort
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort = { [parts[0]]: parts[1] === "asc" ? 1 : -1 };
    }

    const total = await InstitutionProfile.countDocuments(filter);
    const institutions = await InstitutionProfile.find(filter)
      .populate("user", "email name isVerified")
      .populate("location.provinceRef.provinceId", "provinceName")
      .populate("verification.verifiedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      data: institutions,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("getAllInstitutions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/super-admin/scholarships
export const getAllScholarships = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.status && req.query.status !== "all") {
      filter.isActive = req.query.status === "active";
    }

    const total = await Scholarship.countDocuments(filter);
    const scholarships = await Scholarship.find(filter)
      .populate("institutionId", "institutionName user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: scholarships,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("getAllScholarships error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/super-admin/applications
export const getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== "all") {
      filter.applicationStatus = req.query.status;
    }
    if (req.query.search) {
      filter["studentSnapshot.fullName"] = { $regex: req.query.search, $options: "i" };
    }

    const total = await ScholarshipApplication.countDocuments(filter);
    const applications = await ScholarshipApplication.find(filter)
      .populate("scholarshipId", "scholarshipTitle")
      .populate("studentId", "user personal_info")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: applications,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("getAllApplications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/super-admin/reports/detailed
export const getDetailedReports = async (req, res) => {
  try {
    // 1. Applications by Status
    const applicationStats = await ScholarshipApplication.aggregate([
      { $group: { _id: "$applicationStatus", count: { $sum: 1 } } }
    ]);

    // 2. Scholarships by Coverage Type
    const scholarshipStats = await Scholarship.aggregate([
      { $group: { _id: "$coverage.scholarshipType2", count: { $sum: 1 } } }
    ]);

    // 3. Institutions by Verification Status
    const institutionStats = await InstitutionProfile.aggregate([
      { $group: { _id: "$verification.status", count: { $sum: 1 } } }
    ]);

    // Format results to key-value maps
    const formatStats = (agg) => {
      return agg.reduce((acc, curr) => {
        acc[curr._id || "unknown"] = curr.count;
        return acc;
      }, {});
    };

    res.json({
      applications: formatStats(applicationStats),
      scholarships: formatStats(scholarshipStats),
      institutions: formatStats(institutionStats)
    });
  } catch (error) {
    console.error("getDetailedReports error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/super-admin/settings/password
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new password" });
    }

    // req.user contains the decoded token (id, role)
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "Admin user not found" });

    // verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("updateAdminPassword error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
