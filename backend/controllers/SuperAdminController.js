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

    const user = await User.create({
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
  } catch (error) {
    console.error("createProvinceAdmin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
      .populate("assignedProvince", "name")
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

    res.json({
      students: totalStudents,
      institutions: totalInstitutions,
      scholarships: totalScholarships,
      applications: totalApplications,
    });
  } catch (error) {
    console.error("getSystemStats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
