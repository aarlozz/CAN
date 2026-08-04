// scripts/seedProgramOfferings.js
import "dotenv/config";
import mongoose from "mongoose";
import ProgramOffering from "../models/ProgramOffering.js";
import { PROGRAM_OFFERINGS } from "../constants/educationTaxonomy.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  let n = 0;
  for (const o of PROGRAM_OFFERINGS) {
    await ProgramOffering.updateOne(
      { programId: o.programId, universityId: o.universityId },
      { $setOnInsert: { durationYears: o.durationYears } },
      { upsert: true },
    );
    n++;
  }
  console.log(`Seeded ${n} offerings.`);
  await mongoose.disconnect();
}
run();