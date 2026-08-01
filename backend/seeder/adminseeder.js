import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    const password = await bcrypt.hash("Admin@123", 10);

    await User.findOneAndUpdate(
      { email: "superadmin@can.gov.np" },
      {
        fullName: "Super Admin",
        email: "superadmin@can.gov.np",
        password,
        role: "super_admin",
        isVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: "bagmati@can.gov.np" },
      {
        fullName: "Bagmati Admin",
        email: "bagmati@can.gov.np",
        password,
        role: "province_admin",
        province: "Bagmati",
        isVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log("✅ Admins created successfully");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmins();