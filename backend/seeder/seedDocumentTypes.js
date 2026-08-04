/**
 * Run with:  node seed/seedDocumentTypes.js
 * Safe to re-run — uses upsert, so it updates existing rows instead of duplicating.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import DocumentType from "../models/DocumentType.js";
import ScholarshipCategory from "../models/ScholarshipCategory.js";

dotenv.config();

// ─── Scholarship categories (special/reservation types a student can opt into) ───
const categories = [
  { key: "merit_based", label: "Merit-Based", sortOrder: 1 },
  { key: "need_based", label: "Need-Based", sortOrder: 2 },
  { key: "disability", label: "Disability", sortOrder: 3 },
  {
    key: "dalit_janajati_madhesi_muslim",
    label: "Dalit / Janajati / Madhesi / Muslim",
    sortOrder: 4,
  },
  { key: "remote_area", label: "Remote Area", sortOrder: 5 },
  {
    key: "government_school",
    label: "Government / Community School",
    sortOrder: 6,
  },
  {
    key: "municipality_province",
    label: "Municipality / Province Scholarship",
    sortOrder: 7,
  },
  { key: "foreign_scholarship", label: "Foreign Scholarship", sortOrder: 8 },
];

// ─── Document types ───────────────────────────────────────────────────────
const documentTypes = [
  // — Common (every level, every application) —
  { key: "passport_photo", label: "Passport-size Photo", group: "common", sortOrder: 1 },
  { key: "citizenship_certificate", label: "Citizenship Certificate", group: "common", sortOrder: 2 },
  { key: "birth_certificate", label: "Birth Certificate", group: "common", sortOrder: 3 },
  { key: "character_certificate", label: "Character Certificate (Current Level)", group: "common", sortOrder: 4 },

  // — Level: +2 —
  { key: "see_marksheet", label: "SEE Marksheet", group: "level", applicableLevels: ["+2"], sortOrder: 10 },
  { key: "see_transcript", label: "SEE Transcript", group: "level", applicableLevels: ["+2", "Bachelor", "Master", "PhD"], sortOrder: 11 },
  { key: "see_character_certificate", label: "SEE Character Certificate", group: "level", applicableLevels: ["+2", "Bachelor"], sortOrder: 12 },
  { key: "see_admit_card", label: "SEE Admit Card", group: "level", applicableLevels: ["+2"], isRequired: false, sortOrder: 13 },

  // — Level: Bachelor —
  { key: "plus2_transcript", label: "+2 Transcript", group: "level", applicableLevels: ["Bachelor", "Master", "PhD"], sortOrder: 20 },
  { key: "plus2_character_certificate", label: "+2 Character Certificate", group: "level", applicableLevels: ["Bachelor", "Master"], sortOrder: 21 },
  { key: "plus2_provisional_certificate", label: "+2 Provisional Certificate", group: "level", applicableLevels: ["Bachelor"], sortOrder: 22 },
  { key: "entrance_score_card", label: "Entrance Score Card", group: "level", applicableLevels: ["Bachelor"], isRequired: false, sortOrder: 23 },

  // — Level: Master —
  { key: "bachelor_transcript", label: "Bachelor's Transcript", group: "level", applicableLevels: ["Master", "PhD"], sortOrder: 30 },
  { key: "bachelor_character_certificate", label: "Bachelor's Character Certificate", group: "level", applicableLevels: ["Master"], sortOrder: 31 },
  { key: "bachelor_degree_certificate", label: "Bachelor's Degree / Provisional Certificate", group: "level", applicableLevels: ["Master", "PhD"], sortOrder: 32 },

  // — Level: PhD —
  { key: "master_transcript", label: "Master's Transcript", group: "level", applicableLevels: ["PhD"], sortOrder: 40 },
  { key: "master_degree_certificate", label: "Master's Degree Certificate", group: "level", applicableLevels: ["PhD"], sortOrder: 41 },
  { key: "research_proposal", label: "Research Proposal", group: "level", applicableLevels: ["PhD"], sortOrder: 42 },
  { key: "supervisor_acceptance_letter", label: "Supervisor Acceptance Letter", group: "level", applicableLevels: ["PhD"], isRequired: false, sortOrder: 43 },
  { key: "publications", label: "Publications", group: "level", applicableLevels: ["PhD"], isRequired: false, sortOrder: 44 },

  // — Category: merit_based —
  { key: "merit_list", label: "Merit List (if applicable)", group: "category", applicableCategories: ["merit_based"], isRequired: false, sortOrder: 50 },

  // — Category: need_based —
  { key: "income_certificate", label: "Income Certificate", group: "category", applicableCategories: ["need_based"], sortOrder: 51 },
  { key: "guardian_income_proof", label: "Parent/Guardian Income Proof", group: "category", applicableCategories: ["need_based"], sortOrder: 52 },
  { key: "tax_clearance", label: "Tax Clearance", group: "category", applicableCategories: ["need_based"], isRequired: false, sortOrder: 53 },
  { key: "ward_recommendation", label: "Ward Recommendation", group: "category", applicableCategories: ["need_based", "remote_area"], sortOrder: 54 },
  { key: "financial_hardship_letter", label: "Financial Hardship Letter", group: "category", applicableCategories: ["need_based"], sortOrder: 55 },

  // — Category: disability —
  { key: "disability_id_card", label: "Disability ID Card", group: "category", applicableCategories: ["disability"], sortOrder: 60 },
  { key: "disability_certificate", label: "Disability Certificate", group: "category", applicableCategories: ["disability"], sortOrder: 61 },
  { key: "medical_certificate", label: "Medical Certificate", group: "category", applicableCategories: ["disability", "foreign_scholarship"], sortOrder: 62 },

  // — Category: dalit/janajati/madhesi/muslim —
  { key: "caste_ethnicity_certificate", label: "Caste / Ethnicity Certificate", group: "category", applicableCategories: ["dalit_janajati_madhesi_muslim"], sortOrder: 70 },
  { key: "dao_recommendation", label: "DAO / Competent Authority Recommendation", group: "category", applicableCategories: ["dalit_janajati_madhesi_muslim"], sortOrder: 71 },
  { key: "inclusion_certificate", label: "Inclusion / Reservation Certificate", group: "category", applicableCategories: ["dalit_janajati_madhesi_muslim"], isRequired: false, sortOrder: 72 },

  // — Category: remote_area —
  { key: "permanent_citizenship", label: "Permanent Citizenship Certificate", group: "category", applicableCategories: ["remote_area"], sortOrder: 80 },
  { key: "local_government_recommendation", label: "Local Government Recommendation", group: "category", applicableCategories: ["remote_area"], sortOrder: 81 },
  { key: "residence_certificate", label: "Residence Certificate", group: "category", applicableCategories: ["remote_area"], sortOrder: 82 },

  // — Category: government_school —
  { key: "school_recommendation", label: "School Recommendation Letter", group: "category", applicableCategories: ["government_school"], sortOrder: 90 },
  { key: "community_school_proof", label: "Proof of Studying in Community/Government School", group: "category", applicableCategories: ["government_school"], sortOrder: 91 },

  // — Category: municipality_province —
  { key: "permanent_residence_certificate", label: "Permanent Residence Certificate", group: "category", applicableCategories: ["municipality_province"], sortOrder: 100 },
  { key: "recommendation_letter", label: "Recommendation Letter", group: "category", applicableCategories: ["municipality_province", "foreign_scholarship"], isRequired: false, sortOrder: 101 },

  // — Category: foreign_scholarship —
  { key: "passport", label: "Passport", group: "category", applicableCategories: ["foreign_scholarship"], sortOrder: 110 },
  { key: "english_language_certificate", label: "English Language Test Certificate (IELTS/TOEFL)", group: "category", applicableCategories: ["foreign_scholarship"], isRequired: false, sortOrder: 111 },
  { key: "statement_of_purpose", label: "Statement of Purpose", group: "category", applicableCategories: ["foreign_scholarship"], sortOrder: 112 },
  { key: "cv_resume", label: "CV / Resume", group: "category", applicableCategories: ["foreign_scholarship"], sortOrder: 113 },

  // — Optional / bonus (any level, any application — never counted in completion %) —
  { key: "motivation_letter", label: "Motivation Letter", group: "optional", isRequired: false, sortOrder: 200 },
  { key: "personal_statement", label: "Personal Statement", group: "optional", isRequired: false, sortOrder: 201 },
  { key: "volunteer_certificate", label: "Volunteer Certificate", group: "optional", isRequired: false, sortOrder: 202 },
  { key: "sports_certificate", label: "Sports Certificate", group: "optional", isRequired: false, sortOrder: 203 },
  { key: "olympiad_certificate", label: "Olympiad Certificate", group: "optional", isRequired: false, sortOrder: 204 },
  { key: "research_paper", label: "Research Paper", group: "optional", isRequired: false, sortOrder: 205 },
  { key: "training_certificate", label: "Training Certificate", group: "optional", isRequired: false, sortOrder: 206 },
  { key: "experience_certificate", label: "Experience Certificate", group: "optional", isRequired: false, sortOrder: 207 },
  { key: "portfolio", label: "Portfolio (Arts/Architecture/Design)", group: "optional", isRequired: false, sortOrder: 208 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const cat of categories) {
    await ScholarshipCategory.updateOne(
      { key: cat.key },
      { $set: cat },
      { upsert: true }
    );
  }
  console.log(`Seeded ${categories.length} scholarship categories`);

  for (const dt of documentTypes) {
    await DocumentType.updateOne(
      { key: dt.key },
      { $set: dt },
      { upsert: true }
    );
  }
  console.log(`Seeded ${documentTypes.length} document types`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});