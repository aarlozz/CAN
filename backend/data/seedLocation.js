/**
 * SEED SCRIPT — populates Province, District, and Municipality collections
 * from data/nepal_administrative_divisions.json.
 *
 * Why this exists:
 *   seedProvinces.js only inserts the 7 provinces. The Province → District →
 *   Municipality cascade dropdowns call /api/location/districts and
 *   /api/location/municipalities, but until this script runs, District and
 *   Municipality are EMPTY collections — so those dropdowns silently show
 *   nothing after picking a province.
 *
 * Usage:
 *   cd backend
 *   node data/seedLocations.js
 *
 * What it does:
 *  1. Connects to MongoDB using your .env MONGO_URI
 *  2. Upserts the 7 provinces (safe to run even if seedProvinces.js already ran)
 *  3. Clears existing District + Municipality documents
 *  4. Inserts all 77 districts and all ~753 municipalities from the JSON,
 *     each correctly linked to its parent by ObjectId
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Province from "../models/Province.js";
import District from "../models/District.js";
import Municipality from "../models/Municipality.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Same 7 provinces as seedProvinces.js, indexed by province_code (1-7) from the JSON
const PROVINCE_BY_CODE = {
  "1": { provinceName: "Koshi Province", provinceCode: "P1" },
  "2": { provinceName: "Madhesh Province", provinceCode: "P2" },
  "3": { provinceName: "Bagmati Province", provinceCode: "P3" },
  "4": { provinceName: "Gandaki Province", provinceCode: "P4" },
  "5": { provinceName: "Lumbini Province", provinceCode: "P5" },
  "6": { provinceName: "Karnali Province", provinceCode: "P6" },
  "7": { provinceName: "Sudurpashchim Province", provinceCode: "P7" },
};

// Nepal's local levels only ever come in these 4 flavours. We detect the type
// from the name suffix, since the source JSON doesn't include it explicitly.
// IMPORTANT: check "Sub-Metropolitan" before "Metropolitan" — the former
// contains the latter as a substring.
function detectMunicipalityType(name) {
  if (/sub-?\s*metropolitan/i.test(name)) return "Sub-Metropolitan";
  if (/metropolitan/i.test(name)) return "Metropolitan";
  if (/municipality/i.test(name)) return "Municipality";
  return "Rural Municipality"; // everything else, e.g. "...Gaunpalika"
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const jsonPath = path.join(__dirname, "nepal_administrative_divisions.json");
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const provincesData = JSON.parse(raw);

    // ── Step 1: ensure provinces exist (upsert, don't duplicate) ────────────
    const provinceDocs = {}; // province_code -> Province document
    for (const p of provincesData) {
      const meta = PROVINCE_BY_CODE[p.province_code];
      if (!meta) {
        console.warn(`⚠️  Unknown province_code "${p.province_code}", skipping`);
        continue;
      }
      const doc = await Province.findOneAndUpdate(
        { provinceCode: meta.provinceCode },
        { provinceName: meta.provinceName, provinceCode: meta.provinceCode },
        { upsert: true, new: true },
      );
      provinceDocs[p.province_code] = doc;
    }
    console.log(`✅ Ensured ${Object.keys(provinceDocs).length} provinces`);

    // ── Step 2: clear existing districts + municipalities ───────────────────
    await Municipality.deleteMany({});
    await District.deleteMany({});
    console.log("🗑️  Cleared existing districts & municipalities");

    // ── Step 3: insert districts + municipalities ────────────────────────────
    let districtCount = 0;
    let municipalityCount = 0;

    for (const p of provincesData) {
      const provinceDoc = provinceDocs[p.province_code];
      if (!provinceDoc) continue;

      for (const d of p.districts) {
        const districtDoc = await District.create({
          provinceId: provinceDoc._id,
          provinceName: provinceDoc.provinceName,
          districtName: d.name,
        });
        districtCount++;

        const municipalityDocs = d.municipalities.map((m) => ({
          districtId: districtDoc._id,
          districtName: districtDoc.districtName,
          municipalityName: m.name,
          municipalityType: detectMunicipalityType(m.name),
        }));

        if (municipalityDocs.length > 0) {
          await Municipality.insertMany(municipalityDocs);
          municipalityCount += municipalityDocs.length;
        }
      }
    }

    console.log(`✅ Inserted ${districtCount} districts`);
    console.log(`✅ Inserted ${municipalityCount} municipalities`);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
};

seed();
