import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file.");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully.");

    const email = "superadmin@can.org.np";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`⚠️ Super Admin with email ${email} already exists.`);
      process.exit(0);
    }

    const password = process.env.SUPERADMIN_PASSWORD || "SuperAdmin@123!";
    const hashedPassword = await bcrypt.hash(password, 12);

    const superAdmin = await User.create({
      name: "System Administrator",
      email,
      password: hashedPassword,
      role: "super_admin",
      authProvider: "local",
      isVerified: true
    });

    console.log("🚀 Successfully created the first Super Admin account!");
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Password: ${password}`);
    console.log("Please delete this script or change the password immediately after logging in.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed Super Admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
