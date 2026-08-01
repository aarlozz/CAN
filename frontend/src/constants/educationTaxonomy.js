// educationTaxonomy.js
//
// Single source of truth for every education-related dropdown in the app:
// Study Level, Degree/Program, Faculty, University/Affiliation, College Type.
//
// Import from here everywhere instead of hardcoding option lists, so every
// filter panel and every "post a scholarship" form always stays in sync.

// ─── 1. Study Level ─────────────────────────────────────────────────────────
// Value = what gets sent to the API / stored on eligibilityCriteria.targetLevel
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

// ─── 2. Degree / Program ────────────────────────────────────────────────────
// Grouped by faculty area so the <select> can render <optgroup>s.
// This is a representative set — "Other" lets institutions type a custom one.
export const DEGREE_PROGRAMS = [
  {
    group: "Management",
    options: ["BBA", "BBM", "BBS", "BPA", "MBA", "EMBA", "MBS", "MBM"],
  },
  {
    group: "Computer & IT",
    options: [
      "BCA", "BIM", "BIT", "BSc CSIT", "BE Computer", "BE Software",
      "BE IT", "MIT", "MSc CSIT",
    ],
  },
  {
    group: "Engineering",
    options: [
      "BE Civil", "BE Mechanical", "BE Electrical", "BE Electronics",
      "BE Architecture", "BE Aerospace", "BE Industrial",
    ],
  },
  {
    group: "Medical",
    options: [
      "MBBS", "BDS", "BSc Nursing", "BN", "BPH", "BMLT", "B Pharmacy",
      "MD", "MS",
    ],
  },
  {
    group: "Agriculture",
    options: ["BSc Agriculture", "BSc Forestry", "BVSc & AH", "BSc Fisheries"],
  },
  {
    group: "Humanities",
    options: ["BA", "BSW", "MA English", "MA Sociology", "MA Economics"],
  },
  {
    group: "Education",
    options: ["BEd", "MEd"],
  },
  {
    group: "Law",
    options: ["LLB", "BALLB", "LLM"],
  },
  {
    group: "Science",
    options: ["BSc", "MSc", "MPhil", "PhD"],
  },
];

// Flat list, handy for search/autocomplete
export const DEGREE_PROGRAMS_FLAT = DEGREE_PROGRAMS.flatMap((g) => g.options);

// ─── 3. Faculty / Discipline ────────────────────────────────────────────────
export const FACULTIES = [
  "Agriculture",
  "Forestry",
  "Animal Science",
  "Veterinary Science",
  "Computer Science",
  "Information Technology",
  "Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Electronics Engineering",
  "Architecture",
  "Geomatics Engineering",
  "Environmental Science",
  "Biotechnology",
  "Food Technology",
  "Medicine",
  "Dentistry",
  "Nursing",
  "Pharmacy",
  "Public Health",
  "Allied Health Sciences",
  "Management",
  "Finance",
  "Marketing",
  "Hospitality Management",
  "Tourism",
  "Law",
  "Education",
  "Humanities",
  "Social Sciences",
  "Fine Arts",
  "Mass Communication",
  "Journalism",
  "Development Studies",
  "Public Administration",
  "Religion & Theology",
];

// ─── 4. University / Affiliation ────────────────────────────────────────────
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

// ─── 5. College Type ─────────────────────────────────────────────────────────
export const COLLEGE_TYPES = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "community", label: "Community" },
  { value: "constituent_campus", label: "Constituent Campus" },
  { value: "affiliated_college", label: "Affiliated College" },
];
