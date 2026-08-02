// backend/constants/educationTaxonomy.js
//
// Backend copy of the frontend's educationTaxonomy.js. Keep these two files
// identical — this is what makes course validation on the server agree with
// what the EducationCascade dropdown showed the institution on the client.
// If you update the frontend file, copy the change here too.
//
// Single source of truth for education dropdowns — structured as a real
// cascade: Target Level → Faculty/Stream → Program/Major, mirroring how
// Nepal's education system is actually organized:
//   +2          → governed by NEB (streams: Science, Management, ...)
//   Diploma/PCL → governed by CTEVT (Engineering, Health Sciences, ...)
//   Bachelor's / Master's → governed by universities (faculties → programs)

// ─── Study Levels ────────────────────────────────────────────────────────────
export const STUDY_LEVELS = [
  { value: "short_term_training", label: "Short-Term Training" },
  { value: "primary", label: "Primary" },
  { value: "lower_secondary", label: "Lower Secondary" },
  { value: "secondary", label: "Secondary" },
  { value: "see", label: "SEE" },
  { value: "plus_two", label: "Plus Two (+2)" },
  { value: "diploma_pcl", label: "Diploma / PCL" },
  { value: "pre_diploma", label: "Pre-Diploma" },
  { value: "bachelor", label: "Bachelor's" },
  { value: "ca", label: "Chartered Accountancy (CA)" },
  { value: "postgraduate_diploma", label: "Postgraduate Diploma" },
  { value: "master", label: "Master's" },
  { value: "mphil", label: "MPhil (Master of Philosophy)" },
  { value: "phd", label: "Doctorate (PhD)" },
];

// Levels where Faculty/Program selection is meaningful.
// Everything else (primary, lower_secondary, secondary, see, short_term_training,
// ca, pre_diploma, postgraduate_diploma, mphil, phd) has no faculty/program step —
// the form should hide those fields for these levels.
export const LEVELS_WITH_FACULTY = [
  "plus_two",
  "diploma_pcl",
  "bachelor",
  "master",
];

// ─── University / Affiliation (unchanged — independent of level) ───────────
export const UNIVERSITIES = [
  {
    group: "Nepal Universities",
    options: [
      "Tribhuvan University (TU)",
      "Kathmandu University (KU)",
      "Pokhara University (PU)",
      "Purbanchal University",
      "Mid-West University",
      "Far Western University",
      "Agriculture and Forestry University (AFU)",
      "Nepal Sanskrit University",
      "Lumbini Buddhist University",
      "Nepal Open University",
      "Rajarshi Janak University",
      "Bagmati University",
      "Gandaki University",
      "Madan Bhandari University of Science and Technology (MBUST)",
      "Patan Academy of Health Sciences (PAHS)",
      "BP Koirala Institute of Health Sciences (BPKIHS)",
      "Karnali Academy of Health Sciences (KAHS)",
      "National Academy of Medical Sciences (NAMS)",
      "CTEVT",
    ],
  },
  {
    group: "Foreign Affiliations",
    options: [
      "University of London",
      "Coventry University",
      "University of the West of England",
      "Leeds Beckett University",
      "Asia Pacific University",
      "HELP University",
      "University of Wolverhampton",
      "Westcliff University",
      "University of Northampton",
      "Lincoln University College",
      "University of Sunderland",
    ],
  },
];
export const UNIVERSITIES_FLAT = UNIVERSITIES.flatMap((g) => g.options);

// ─── College Type (unchanged) ───────────────────────────────────────────────
export const COLLEGE_TYPES = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "community", label: "Community" },
  { value: "constituent_campus", label: "Constituent Campus" },
  { value: "affiliated_college", label: "Affiliated College" },
];

// ─── THE CASCADE: Level → Faculty → Program ─────────────────────────────────
// Each key is a STUDY_LEVELS value. `faculties` is the ordered list of streams
// available at that level. `programs[faculty]` gives the programs under that
// faculty, at that level only. This is what makes "+2" only ever offer +2
// streams, and "Bachelor's" only ever offer bachelor's-level programs.
export const LEVEL_TAXONOMY = {
  plus_two: {
    faculties: ["Science", "Management", "Humanities", "Education", "Law"],
    programs: {
      Science: ["Physical Science (Physics, Chemistry, Math)", "Biology"],
      Management: ["Management"],
      Humanities: ["Humanities and Social Sciences"],
      Education: ["Education"],
      Law: ["Law"],
    },
  },

  diploma_pcl: {
    // Matches CTEVT's actual program coverage: Engineering, Health, Agriculture,
    // Hospitality, Forestry, plus Computer Science, Electronics, and Geomatics
    // offered as distinct diploma tracks (not folded into general Engineering).
    faculties: [
      "Engineering",
      "Computer Science & Electronics",
      "Health Sciences",
      "Agriculture",
      "Forestry",
      "Hospitality & Hotel Management",
      "Management",
    ],
    programs: {
      Engineering: [
        "Diploma in Civil Engineering",
        "Diploma in Electrical Engineering",
        "Diploma in Architecture",
        "Diploma in Automobile Engineering",
        "Diploma in Mechanical Engineering",
        "Diploma in Geomatics (Survey) Engineering",
      ],
      "Computer Science & Electronics": [
        "Diploma in Computer Engineering",
        "Diploma in Electronics & Communication Engineering",
      ],
      "Health Sciences": [
        "Diploma in Pharmacy",
        "PCL / Diploma in Nursing (Staff Nurse)",
        "Diploma in Medical Lab Technology (DMLT)",
        "Diploma in Radiography",
        "Diploma in Ayurveda (CTAMS)",
        "Diploma in Health Assistant (HA)",
      ],
      Agriculture: ["Diploma in Agriculture", "Diploma in Animal Science"],
      Forestry: ["Diploma in Forestry"],
      "Hospitality & Hotel Management": ["Diploma in Hotel Management"],
      Management: ["PCL Management"],
    },
  },

  bachelor: {
    faculties: [
      "Management",
      "Computer & IT",
      "Engineering",
      "Medical & Health Sciences",
      "Agriculture & Veterinary Science",
      "Humanities & Social Sciences",
      "Education",
      "Law",
      "Science",
    ],
    programs: {
      Management: [
        "BBA",
        "BBM",
        "BBS",
        "BPA",
        "Bachelor of Economics (BEco)",
        "Bachelor in International Business (BIB)",
        "Bachelor in Travel & Tourism Management (BTTM)",
      ],
      "Computer & IT": [
        "BCA",
        "BIM",
        "BIT",
        "BSc CSIT",
        "BE Computer",
        "BE Software",
        "BSc IT",
      ],
      Engineering: [
        "BE Civil",
        "BE Mechanical",
        "BE Electrical",
        "BE Electronics & Communication",
        "B.Arch (Architecture)",
        "BE Aerospace",
        "BE Industrial",
        "BE Automobile",
        "BE Agricultural",
        "BE Geomatics / Geo-informatics",
        "BE Chemical",
        "BE Mining",
      ],
      "Medical & Health Sciences": [
        "MBBS",
        "BDS",
        "BSc Nursing",
        "BN (Bachelor of Nursing)",
        "BPH (Public Health)",
        "BMLT (Medical Lab Technology)",
        "B Pharmacy",
        "BPT (Physiotherapy)",
        "BOT (Occupational Therapy)",
        "BASLP (Audiology & Speech Language Pathology)",
        "BRIT (Radiologic Imaging Technology)",
      ],
      "Agriculture & Veterinary Science": [
        "BSc Agriculture",
        "BSc Forestry",
        "BVSc & AH (Veterinary)",
        "BSc Fisheries",
        "BSc Food Technology",
      ],
      "Humanities & Social Sciences": [
        "BA",
        "BSW (Social Work)",
        "BA in Journalism & Mass Communication (BAJMC)",
        "BA Sociology",
        "BA Economics",
        "BA Development Studies",
      ],
      Education: [
        "BEd",
        "BEd in Science Education",
        "BEd in English Education",
        "BEd in Health Education",
      ],
      Law: ["LLB", "BALLB", "BBM-LLB", "BEC-LLB"],
      Science: [
        "BSc (General)",
        "BSc Physics",
        "BSc Chemistry",
        "BSc Botany",
        "BSc Zoology",
        "BSc Microbiology",
        "BSc Environmental Science",
        "BSc Biotechnology",
        "BSc Statistics",
      ],
    },
  },

  master: {
    faculties: [
      "Management",
      "Computer & IT",
      "Engineering",
      "Medical & Health Sciences",
      "Agriculture & Veterinary Science",
      "Humanities & Social Sciences",
      "Education",
      "Law",
      "Science",
    ],
    programs: {
      Management: ["MBA", "EMBA", "MBS", "MBM"],
      "Computer & IT": ["MIT", "MSc CSIT"],
      Engineering: [
        "ME Civil",
        "ME Structural",
        "ME Electrical",
        "ME Computer",
        "M.Arch",
      ],
      "Medical & Health Sciences": ["MD", "MS", "MPH", "MSc Nursing"],
      "Agriculture & Veterinary Science": [
        "MSc Agriculture",
        "MSc Forestry",
        "MVSc",
      ],
      "Humanities & Social Sciences": [
        "MA English",
        "MA Sociology",
        "MA Economics",
        "MA Development Studies",
      ],
      Education: ["MEd"],
      Law: ["LLM"],
      Science: ["MSc"],
    },
  },
};

// Flat list of every program across all levels — handy for search/autocomplete
export const ALL_PROGRAMS_FLAT = Object.values(LEVEL_TAXONOMY).flatMap((lvl) =>
  Object.values(lvl.programs).flat(),
);

// ── Helper accessors ─────────────────────────────────────────────────────────

// Faculties available for a given level. Returns [] if the level has no
// faculty step (e.g. "see", "primary") — form should hide the field then.
export function getFacultiesForLevel(level) {
  return LEVEL_TAXONOMY[level]?.faculties || [];
}

// Programs available for a given level + faculty combo.
export function getProgramsForFaculty(level, faculty) {
  return LEVEL_TAXONOMY[level]?.programs?.[faculty] || [];
}