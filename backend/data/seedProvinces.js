/**
 * SEED SCRIPT — Run once to populate provinces into MongoDB.
 *
 * Usage:
 *   cd backend
 *   node data/seedProvinces.js
 *
 * What it does:
 *  1. Connects to MongoDB using your .env MONGO_URI
 *  2. Clears existing Province documents
 *  3. Inserts Nepal's 7 official provinces
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Province from "../models/Province.js";

dotenv.config();

const PROVINCES = [
  { provinceName: "Koshi Province",       provinceCode: "P1" },
  { provinceName: "Madhesh Province",     provinceCode: "P2" },
  { provinceName: "Bagmati Province",     provinceCode: "P3" },
  { provinceName: "Gandaki Province",     provinceCode: "P4" },
  { provinceName: "Lumbini Province",     provinceCode: "P5" },
  { provinceName: "Karnali Province",     provinceCode: "P6" },
  { provinceName: "Sudurpashchim Province", provinceCode: "P7" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Province.deleteMany({});
    console.log("🗑️ Cleared existing provinces");

    const inserted = await Province.insertMany(PROVINCES);
    console.log(`✅ Inserted ${inserted.length} provinces:`);
    inserted.forEach((p) => console.log(`   • ${p.provinceName} (${p.provinceCode}) — _id: ${p._id}`));
  } catch (error) {
    console.error("❌ Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
};

seed();