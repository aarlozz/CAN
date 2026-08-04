// educationTaxonomy.js
//
// Normalized, ID-based source of truth for Nepal's education system.
// Keep this file identical on frontend and backend — course validation on
// the server must agree with what the EducationCascade dropdown showed.
//
// WHY THIS SHAPE (v2):
//   - Every faculty and program has a stable `id`. Display names (`name`)
//     can be edited freely without breaking stored student/scholarship
//     records, which reference the id, not the string.
//   - Faculties are a shared catalog. "Engineering" at Bachelor's and
//     Master's is the SAME faculty (id: "engineering"), so a scholarship
//     rule like "all Engineering students" only has to list one facultyId
//     to match both levels. +2 "Science" and Bachelor's "Science" are NOT
//     merged — a +2 stream and a university faculty are structurally
//     different things — so they get distinct ids (plus_two_science vs
//     science).
//   - Programs carry `levelId` + `facultyId` (not duplicated per
//     university). Anything that varies by university — duration nuance,
//     which universities actually offer it, degree-award wording — lives
//     in PROGRAM_OFFERINGS, a join table, not on the program object.
//     Otherwise a curriculum tweak at one university would force editing
//     an object shared by every other university offering the program.
//   - Universities are their own catalog, referenced by id everywhere
//     (matches UNIVERSITIES_FLAT strings from the old file 1:1, so
//     existing free-text data can be migrated by exact-name lookup).
//   - Campus/College is deliberately NOT modeled here as static data.
//     TU alone has 400+ affiliated colleges; that's operational data that
//     changes constantly and belongs in a real DB table managed through
//     admin CRUD (see models/College.js), not a JS array requiring a
//     code deploy every time a college's affiliation changes.
//
// Course lists cross-checked against collegesnepal.com's live program
// listings for TU, KU, Pokhara University, and Purbanchal University
// (Aug 2026). Foreign-affiliated programs are out of scope for the
// LEVEL_TAXONOMY cascade; UNIVERSITIES still lists foreign affiliations
// (for the University dropdown) since students report affiliation even
// when the degree-granting body is abroad.
//
// `typicalDurationYears` on a program is a DISPLAY DEFAULT ONLY — the
// authoritative duration for a specific program-at-a-specific-university
// belongs in PROGRAM_OFFERINGS (or the DB equivalent), since duration can
// legitimately differ by curriculum revision between universities.

// ─── Governing bodies ────────────────────────────────────────────────────────
export const GOVERNING_BODIES = {
  NEB: "neb",
  CTEVT: "ctevt",
  ICAN: "ican",
  UNIVERSITY: "university",
  SCHOOL_CURRICULUM: "school_curriculum",
  TRAINING_PROVIDER: "training_provider",
};

export const GOVERNING_BODY_LABELS = {
  neb: "National Examinations Board (NEB)",
  ctevt: "CTEVT",
  ican: "Institute of Chartered Accountants of Nepal (ICAN)",
  university: "University",
  school_curriculum: "Ministry of Education (school curriculum)",
  training_provider: "Training provider",
};

// ─── Study Levels ────────────────────────────────────────────────────────────
// hasFaculty: whether this level has a Faculty/Program cascade step at all.
// universityAffiliated: whether the University/Affiliation dropdown should
// show for this level. NOTE these two flags diverge at plus_two and
// diploma_pcl (faculty step exists, but neither is a university degree).
export const STUDY_LEVELS = [
  { id: "short_term_training", name: "Short-Term Training", hasFaculty: false, governingBody: GOVERNING_BODIES.TRAINING_PROVIDER, universityAffiliated: false },
  { id: "primary", name: "Primary", hasFaculty: false, governingBody: GOVERNING_BODIES.SCHOOL_CURRICULUM, universityAffiliated: false },
  { id: "lower_secondary", name: "Lower Secondary", hasFaculty: false, governingBody: GOVERNING_BODIES.SCHOOL_CURRICULUM, universityAffiliated: false },
  { id: "secondary", name: "Secondary", hasFaculty: false, governingBody: GOVERNING_BODIES.SCHOOL_CURRICULUM, universityAffiliated: false },
  { id: "see", name: "SEE", hasFaculty: false, governingBody: GOVERNING_BODIES.NEB, universityAffiliated: false },
  { id: "plus_two", name: "Plus Two (+2)", hasFaculty: true, governingBody: GOVERNING_BODIES.NEB, universityAffiliated: false },
  { id: "diploma_pcl", name: "Diploma / PCL", hasFaculty: true, governingBody: GOVERNING_BODIES.CTEVT, universityAffiliated: false },
  { id: "pre_diploma", name: "Pre-Diploma", hasFaculty: false, governingBody: GOVERNING_BODIES.CTEVT, universityAffiliated: false },
  { id: "bachelor", name: "Bachelor's", hasFaculty: true, governingBody: GOVERNING_BODIES.UNIVERSITY, universityAffiliated: true },
  { id: "ca", name: "Chartered Accountancy (CA)", hasFaculty: false, governingBody: GOVERNING_BODIES.ICAN, universityAffiliated: false },
  { id: "postgraduate_diploma", name: "Postgraduate Diploma", hasFaculty: false, governingBody: GOVERNING_BODIES.UNIVERSITY, universityAffiliated: true },
  { id: "master", name: "Master's", hasFaculty: true, governingBody: GOVERNING_BODIES.UNIVERSITY, universityAffiliated: true },
  { id: "mphil", name: "MPhil (Master of Philosophy)", hasFaculty: false, governingBody: GOVERNING_BODIES.UNIVERSITY, universityAffiliated: true },
  { id: "phd", name: "Doctorate (PhD)", hasFaculty: false, governingBody: GOVERNING_BODIES.UNIVERSITY, universityAffiliated: true },
];

export const STUDY_LEVELS_BY_ID = Object.fromEntries(STUDY_LEVELS.map((l) => [l.id, l]));

// Derived — kept for convenience / backward compatibility with old call sites.
export const LEVELS_WITH_FACULTY = STUDY_LEVELS.filter((l) => l.hasFaculty).map((l) => l.id);
export const LEVELS_AFFILIATED_WITH_UNIVERSITY = STUDY_LEVELS.filter((l) => l.universityAffiliated).map((l) => l.id);

// ─── Universities ────────────────────────────────────────────────────────────
// group: "nepal" | "foreign_affiliation"
// hasOwnPlusTwo: university runs its own +2 wing directly (KU High School,
// Nepal Sanskrit University's +2 classes) rather than through NEB-affiliated
// colleges. Still an NEB-governed qualification nationally — this is just a
// UI hint ("this university also offers +2"), not an affiliation fact.
export const UNIVERSITIES = [
  { id: "tu", name: "Tribhuvan University", shortName: "TU", group: "nepal", hasOwnPlusTwo: false },
  { id: "ku", name: "Kathmandu University", shortName: "KU", group: "nepal", hasOwnPlusTwo: true },
  { id: "pu", name: "Pokhara University", shortName: "PU", group: "nepal", hasOwnPlusTwo: false },
  { id: "purbanchal", name: "Purbanchal University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "mid_west", name: "Mid-West University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "far_western", name: "Far Western University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "afu", name: "Agriculture and Forestry University", shortName: "AFU", group: "nepal", hasOwnPlusTwo: false },
  { id: "sanskrit", name: "Nepal Sanskrit University", shortName: null, group: "nepal", hasOwnPlusTwo: true },
  { id: "lumbini_buddhist", name: "Lumbini Buddhist University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "open_university", name: "Nepal Open University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "rajarshi_janak", name: "Rajarshi Janak University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "bagmati", name: "Bagmati University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "gandaki", name: "Gandaki University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "mbust", name: "Madan Bhandari University of Science and Technology", shortName: "MBUST", group: "nepal", hasOwnPlusTwo: false },
  { id: "manmohan_technical", name: "Manmohan Technical University", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "pahs", name: "Patan Academy of Health Sciences", shortName: "PAHS", group: "nepal", hasOwnPlusTwo: false },
  { id: "bpkihs", name: "BP Koirala Institute of Health Sciences", shortName: "BPKIHS", group: "nepal", hasOwnPlusTwo: false },
  { id: "kahs", name: "Karnali Academy of Health Sciences", shortName: "KAHS", group: "nepal", hasOwnPlusTwo: false },
  { id: "nams", name: "National Academy of Medical Sciences", shortName: "NAMS", group: "nepal", hasOwnPlusTwo: false },
  { id: "mbahs", name: "Madan Bhandari Academy of Health Sciences", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "mihs", name: "Madhesh Institute of Health Sciences", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "rahs", name: "Rapti Academy of Health Sciences", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "pokhara_ahs", name: "Pokhara Academy of Health Sciences", shortName: null, group: "nepal", hasOwnPlusTwo: false },
  { id: "ctevt", name: "CTEVT", shortName: null, group: "nepal", hasOwnPlusTwo: false },

  { id: "univ_london", name: "University of London", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "coventry", name: "Coventry University", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "uwe", name: "University of the West of England", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "leeds_beckett", name: "Leeds Beckett University", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "apu", name: "Asia Pacific University", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "help_university", name: "HELP University", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "wolverhampton", name: "University of Wolverhampton", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "westcliff", name: "Westcliff University", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "northampton", name: "University of Northampton", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "lincoln_college", name: "Lincoln University College", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
  { id: "sunderland", name: "University of Sunderland", shortName: null, group: "foreign_affiliation", hasOwnPlusTwo: false },
];

export const UNIVERSITIES_BY_ID = Object.fromEntries(UNIVERSITIES.map((u) => [u.id, u]));

// ─── College Types (unchanged) ──────────────────────────────────────────────
export const COLLEGE_TYPES = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "community", label: "Community" },
  { value: "constituent_campus", label: "Constituent Campus" },
  { value: "affiliated_college", label: "Affiliated College" },
];

// ─── Faculties ───────────────────────────────────────────────────────────────
// appliesToLevels: which STUDY_LEVELS ids this faculty is valid under.
// Shared where the domain is genuinely the same thing (Bachelor's/Master's
// Engineering). +2 and Diploma/PCL get their own namespaced ids
// (plus_two_*, diploma_*) since a NEB stream and a CTEVT technical stream
// are not the same entity as a university faculty, even when named alike.
export const FACULTIES = [
  // +2 (NEB streams)
  { id: "plus_two_science", name: "Science", appliesToLevels: ["plus_two"] },
  { id: "plus_two_management", name: "Management", appliesToLevels: ["plus_two"] },
  { id: "plus_two_humanities", name: "Humanities", appliesToLevels: ["plus_two"] },
  { id: "plus_two_education", name: "Education", appliesToLevels: ["plus_two"] },
  { id: "plus_two_law", name: "Law", appliesToLevels: ["plus_two"] },

  // Diploma / PCL (CTEVT streams)
  { id: "diploma_engineering", name: "Engineering", appliesToLevels: ["diploma_pcl"] },
  { id: "diploma_cs_electronics", name: "Computer Science & Electronics", appliesToLevels: ["diploma_pcl"] },
  { id: "diploma_health_sciences", name: "Health Sciences", appliesToLevels: ["diploma_pcl"] },
  { id: "diploma_agriculture", name: "Agriculture", appliesToLevels: ["diploma_pcl"] },
  { id: "diploma_forestry", name: "Forestry", appliesToLevels: ["diploma_pcl"] },
  { id: "diploma_hospitality", name: "Hospitality & Hotel Management", appliesToLevels: ["diploma_pcl"] },
  { id: "diploma_management", name: "Management", appliesToLevels: ["diploma_pcl"] },

  // Bachelor's + Master's shared faculties
  { id: "management", name: "Management", appliesToLevels: ["bachelor", "master"] },
  { id: "computer_it", name: "Computer & IT", appliesToLevels: ["bachelor", "master"] },
  { id: "engineering", name: "Engineering", appliesToLevels: ["bachelor", "master"] },
  { id: "medical_health", name: "Medical & Health Sciences", appliesToLevels: ["bachelor", "master"] },
  { id: "agriculture_veterinary", name: "Agriculture & Veterinary Science", appliesToLevels: ["bachelor", "master"] },
  { id: "humanities_social_sciences", name: "Humanities & Social Sciences", appliesToLevels: ["bachelor", "master"] },
  { id: "education", name: "Education", appliesToLevels: ["bachelor", "master"] },
  { id: "law", name: "Law", appliesToLevels: ["bachelor", "master"] },
  { id: "science", name: "Science", appliesToLevels: ["bachelor", "master"] },

  // Bachelor-only / Master-only faculties
  { id: "arts_design_media", name: "Arts, Design & Media", appliesToLevels: ["bachelor"] },
  { id: "hospitality_travel_aviation", name: "Hospitality, Travel & Aviation", appliesToLevels: ["bachelor"] },
  { id: "hospitality_development", name: "Hospitality & Development", appliesToLevels: ["master"] },
];

export const FACULTIES_BY_ID = Object.fromEntries(FACULTIES.map((f) => [f.id, f]));

// ─── Programs ────────────────────────────────────────────────────────────────
// Small builder to keep the raw lists readable. `aliases` are alternate
// spellings/short-forms worth matching on search (extend freely — this is
// not exhaustive). `typicalDurationYears`, if omitted, is filled in by
// DEFAULT_DURATION_BY_LEVEL below at flatten time.
function prog(id, name, opts = {}) {
  return {
    id,
    name,
    aliases: opts.aliases || [],
    typicalDurationYears: opts.typicalDurationYears ?? null,
  };
}

// Fallback duration (years) by level, used only when a program doesn't
// specify its own typicalDurationYears override above.
const DEFAULT_DURATION_BY_LEVEL = {
  plus_two: 2,
  diploma_pcl: 3,
  bachelor: 4,
  master: 2,
};

// Raw cascade, grouped the same way the original file was (level -> faculty
// -> programs), so this stays easy to diff against the old source when
// updating course lists. PROGRAMS (flattened, below) is what code should
// actually import and query.
const RAW_LEVEL_FACULTY_PROGRAMS = {
  plus_two: {
    plus_two_science: [
      prog("plus_two_physical_science", "Physical Science (Physics, Chemistry, Math)"),
      prog("plus_two_biology", "Biology"),
    ],
    plus_two_management: [prog("plus_two_management_stream", "Management")],
    plus_two_humanities: [prog("plus_two_humanities_social_sciences", "Humanities and Social Sciences")],
    plus_two_education: [prog("plus_two_education_stream", "Education")],
    plus_two_law: [prog("plus_two_law_stream", "Law")],
  },

  diploma_pcl: {
    diploma_engineering: [
      prog("dip_civil", "Diploma in Civil Engineering"),
      prog("dip_electrical", "Diploma in Electrical Engineering"),
      prog("dip_architecture", "Diploma in Architecture"),
      prog("dip_automobile", "Diploma in Automobile Engineering"),
      prog("dip_mechanical", "Diploma in Mechanical Engineering"),
      prog("dip_geomatics", "Diploma in Geomatics (Survey) Engineering"),
    ],
    diploma_cs_electronics: [
      prog("dip_computer_engineering", "Diploma in Computer Engineering"),
      prog("dip_electronics_comm", "Diploma in Electronics & Communication Engineering"),
    ],
    diploma_health_sciences: [
      prog("dip_pharmacy", "Diploma in Pharmacy"),
      prog("pcl_nursing", "PCL / Diploma in Nursing (Staff Nurse)", { typicalDurationYears: 2 }),
      prog("dmlt", "Diploma in Medical Lab Technology (DMLT)"),
      prog("dip_radiography", "Diploma in Radiography"),
      prog("dip_ayurveda_ctams", "Diploma in Ayurveda (CTAMS)"),
      prog("dip_health_assistant", "Diploma in Health Assistant (HA)"),
    ],
    diploma_agriculture: [
      prog("dip_agriculture", "Diploma in Agriculture"),
      prog("dip_animal_science", "Diploma in Animal Science"),
    ],
    diploma_forestry: [prog("dip_forestry", "Diploma in Forestry")],
    diploma_hospitality: [prog("dip_hotel_management", "Diploma in Hotel Management")],
    diploma_management: [prog("pcl_management", "PCL Management", { typicalDurationYears: 2 })],
  },

  bachelor: {
    management: [
      prog("bba", "BBA", { aliases: ["Bachelor of Business Administration"] }),
      prog("bbm", "BBM", { aliases: ["Bachelor of Business Management"] }),
      prog("bbs", "BBS", { aliases: ["Bachelor of Business Studies"] }),
      prog("bpa_mgmt", "BPA", { aliases: ["Bachelor of Public Administration"] }),
      prog("beco", "Bachelor of Economics (BEco)"),
      prog("bib", "Bachelor in International Business (BIB)"),
      prog("bcs_commerce", "Bachelor of Commerce Studies (BCS)"),
      prog("bba_finance", "BBA in Finance"),
      prog("bba_bi", "BBA in Banking & Insurance (BBA-BI)"),
      prog("bbis", "Bachelor of Business Information System (BBIS)"),
      prog("bdf", "Bachelor in Development Finance (BDF)"),
    ],
    computer_it: [
      prog("bca", "BCA", { aliases: ["Bachelor of Computer Application"] }),
      prog("bim", "BIM", { aliases: ["Bachelor of Information Management"] }),
      prog("bit", "BIT", { aliases: ["Bachelor of Information Technology"] }),
      prog("bsc_csit", "BSc CSIT", { aliases: ["CSIT", "B.Sc CSIT", "BSc. CSIT"] }),
      prog("be_computer", "BE Computer"),
      prog("be_software", "BE Software"),
      prog("bsc_it", "BSc IT"),
      prog("bcis", "Bachelor of Computer Information System (BCIS)"),
      prog("bcsit_alt", "Bachelor of Computer Systems & IT (BCSIT)"),
      prog("b_data_science", "Bachelor in Data Science"),
      prog("btech_cybersecurity", "Bachelor of Technology (B.Tech) in Cybersecurity"),
    ],
    engineering: [
      prog("be_civil", "BE Civil"),
      prog("be_mechanical", "BE Mechanical"),
      prog("be_electrical", "BE Electrical"),
      prog("be_electrical_electronics", "BE Electrical & Electronics"),
      prog("be_electronics_comm", "BE Electronics & Communication"),
      prog("b_arch", "B.Arch (Architecture)", { aliases: ["Bachelor of Architecture"], typicalDurationYears: 5 }),
      prog("be_aerospace", "BE Aerospace"),
      prog("be_industrial", "BE Industrial"),
      prog("be_automobile", "BE Automobile"),
      prog("be_agricultural", "BE Agricultural"),
      prog("be_geomatics", "BE Geomatics / Geo-informatics"),
      prog("be_chemical", "BE Chemical"),
      prog("be_mining", "BE Mining"),
      prog("be_biomedical", "BE Biomedical Engineering"),
      prog("btech_environmental", "BTech Environmental Engineering"),
    ],
    medical_health: [
      prog("mbbs", "MBBS", { typicalDurationYears: 5.5 }),
      prog("bds", "BDS", { aliases: ["Bachelor of Dental Surgery"], typicalDurationYears: 5 }),
      prog("bsc_nursing", "BSc Nursing"),
      prog("bn_nursing", "BN (Bachelor of Nursing)"),
      prog("pbn", "Post Basic Bachelor of Nursing (PBN)"),
      prog("bph", "Bachelor of Public Health (BPH)"),
      prog("bmlt", "BMLT (Medical Lab Technology)"),
      prog("b_pharmacy", "B Pharmacy"),
      prog("bpt", "BPT (Physiotherapy)"),
      prog("bot", "BOT (Occupational Therapy)"),
      prog("baslp", "BASLP (Audiology & Speech Language Pathology)"),
      prog("brit", "BRIT (Radiologic Imaging Technology)"),
      prog("bams", "Bachelor of Ayurvedic Medicine & Surgery (BAMS)", { typicalDurationYears: 5.5 }),
      prog("bhms", "Bachelor of Homeopathic Medicine & Surgery (BHMS)", { typicalDurationYears: 5.5 }),
      prog("b_optometry", "Bachelor of Optometry"),
      prog("b_perfusion", "Bachelor in Perfusion Technology"),
      prog("bsc_medical_imaging", "BSc Medical Imaging / Radiographic Technology"),
      prog("bhcm", "Bachelor of Health Care Management (BHCM)"),
      prog("bsc_human_biology", "BSc Human Biology"),
      prog("bsc_medical_biochemistry", "BSc Medical Biochemistry"),
    ],
    agriculture_veterinary: [
      prog("bsc_agriculture", "BSc Agriculture"),
      prog("bsc_forestry", "BSc Forestry"),
      prog("bvsc_ah", "BVSc & AH (Veterinary)", { typicalDurationYears: 5 }),
      prog("bsc_fisheries", "BSc Fisheries"),
      prog("bsc_food_technology", "BSc Food Technology"),
      prog("b_dairy_technology", "Bachelor of Dairy Technology"),
      prog("bsc_horticulture_floriculture", "BSc Horticulture & Floriculture Management"),
      prog("bsc_tea_technology", "BSc Tea Technology & Management"),
    ],
    humanities_social_sciences: [
      prog("ba_general", "BA"),
      prog("bsw", "BSW (Social Work)"),
      prog("bajmc", "BA in Journalism & Mass Communication (BAJMC)"),
      prog("ba_sociology", "BA Sociology"),
      prog("ba_economics", "BA Economics"),
      prog("ba_psychology", "BA Psychology"),
      prog("ba_rural_development", "BA Rural Development"),
      prog("bdevs", "Bachelor of Development Studies (BDEVS)"),
      prog("bss", "Bachelor of Social Sciences (BSS)"),
      prog("ba_buddhist_studies", "Bachelor (BA) in Buddhist Studies"),
      prog("b_english_comm_studies", "Bachelor of English & Communication Studies"),
      prog("bpa_humanities", "Bachelor of Public Administration (BPA)"),
    ],
    education: [
      prog("bed", "BEd"),
      prog("bed_science", "BEd in Science Education"),
      prog("bed_english", "BEd in English Education"),
      prog("bed_health", "BEd in Health Education"),
      prog("bed_ict", "BEd in Information Communication Technology (BEd ICT)"),
    ],
    law: [
      prog("llb", "LLB", { typicalDurationYears: 3 }),
      prog("ballb", "BALLB", { typicalDurationYears: 5 }),
      prog("bbm_llb", "BBM-LLB", { typicalDurationYears: 5 }),
      prog("bec_llb", "BEC-LLB", { typicalDurationYears: 5 }),
    ],
    science: [
      prog("bsc_general", "BSc (General)"),
      prog("bsc_physics", "BSc Physics"),
      prog("bsc_applied_physics", "BSc Applied Physics"),
      prog("bsc_chemistry", "BSc Chemistry"),
      prog("bsc_botany", "BSc Botany"),
      prog("bsc_zoology", "BSc Zoology"),
      prog("bsc_microbiology", "BSc Microbiology"),
      prog("bsc_environmental_science", "BSc Environmental Science"),
      prog("bsc_biotechnology", "BSc Biotechnology"),
      prog("bsc_statistics", "BSc Statistics"),
      prog("bsc_mathematics", "BSc Mathematics"),
      prog("bsc_geology", "BSc Geology"),
      prog("bsc_meteorology", "BSc Meteorology"),
      prog("bsc_biochemistry", "BSc Biochemistry"),
    ],
    arts_design_media: [
      prog("bfa", "Bachelor of Fine Arts (BFA)"),
      prog("bfa_classical_dance", "BFA in Classical Dance"),
      prog("bfa_classical_music", "BFA in Classical Music"),
      prog("bfa_graphic_comm", "BFA in Graphic Communication"),
      prog("bfa_sculpture", "BFA in Sculpture"),
      prog("bfd", "Bachelor of Fashion Design (BFD)"),
      prog("bid", "Bachelor of Interior Design (BID)"),
      prog("bms_media", "Bachelor of Media Studies (BMS)"),
      prog("bmt_media_tech", "Bachelor in Media Technology (BMT)"),
      prog("bfilm_acting", "Bachelor in Film Studies (Acting)"),
      prog("bfilm_cinematography", "Bachelor in Film Studies (Cinematography)"),
      prog("bfilm_editing", "Bachelor in Film Studies (Editing)"),
      prog("bfilm_audiography", "Bachelor in Film Studies (Audiography)"),
      prog("bfilm_screenplay", "Bachelor of Film Studies (Screenplay Writing & Direction)"),
      prog("b_mountaineering_studies", "Bachelor of Mountaineering Studies"),
    ],
    hospitality_travel_aviation: [
      prog("bhm", "Bachelor of Hotel Management (BHM)"),
      prog("bttm", "Bachelor of Travel & Tourism Management (BTTM)"),
      prog("bba_tt", "BBA in Travel & Tourism (BBA-TT)"),
      prog("b_hospitality_tourism_mgmt", "Bachelor of Hospitality & Tourism Management"),
      prog("b_professional_hospitality", "Bachelor of Professional Hospitality"),
      prog("b_aviation_management", "Bachelor of Aviation Management"),
    ],
  },

  master: {
    management: [
      prog("mba", "MBA"),
      prog("mba_executive", "MBA Executive (EMBA)"),
      prog("mba_finance", "MBA Finance"),
      prog("mba_global_leadership", "MBA Global Business / Leadership"),
      prog("mbs", "MBS"),
      prog("mbm_master", "MBM"),
      prog("mbe", "Master in Business Economics (MBE)"),
    ],
    computer_it: [
      prog("mit", "MIT"),
      prog("msc_csit", "MSc CSIT"),
      prog("mca", "Master of Computer Application (MCA)"),
      prog("mcis", "Master of Computer Information System (MCIS)"),
      prog("m_computer_science", "Master of Computer Science"),
      prog("mtech_it", "Master of Technology (MTech) in IT"),
    ],
    engineering: [
      prog("me_civil", "ME Civil"),
      prog("me_structural", "ME Structural"),
      prog("me_electrical_power", "ME Electrical / Power"),
      prog("me_computer", "ME Computer"),
      prog("me_communication", "ME Communication"),
      prog("me_mechanical", "ME Mechanical"),
      prog("me_geoinformatics", "ME Geoinformatics"),
      prog("me_earthquake", "ME Earthquake Engineering"),
      prog("m_arch", "M.Arch"),
      prog("msc_construction_mgmt", "MSc Construction Management"),
      prog("msc_transportation_eng", "MSc Transportation Engineering & Management"),
    ],
    medical_health: [
      prog("md", "MD", { typicalDurationYears: 3 }),
      prog("ms_surgery", "MS", { typicalDurationYears: 3 }),
      prog("mph", "MPH (Master of Public Health)"),
      prog("msc_nursing", "MSc Nursing"),
      prog("mn_nursing", "Master of Nursing (MN)"),
      prog("m_pharmacy", "Master in Pharmacy / MSc Pharmacy"),
      prog("mds", "Master of Dental Surgery (MDS)", { typicalDurationYears: 3 }),
      prog("mhcm", "Master of Health Care Management (MHCM)"),
    ],
    agriculture_veterinary: [
      prog("msc_agriculture", "MSc Agriculture"),
      prog("msc_forestry", "MSc Forestry"),
      prog("mvsc", "MVSc"),
      prog("msc_dairy_technology", "MSc Dairy Technology"),
      prog("msc_meat_technology", "MSc Meat Technology"),
    ],
    humanities_social_sciences: [
      prog("ma_english", "MA English"),
      prog("ma_sociology_anthropology", "MA Sociology / Anthropology"),
      prog("ma_economics", "MA Economics"),
      prog("ma_development_studies", "MA Development Studies"),
      prog("ma_jmc", "MA in Journalism & Mass Communication"),
      prog("ma_population_gender_dev", "MA in Population, Gender & Development"),
      prog("ma_buddhist_studies", "MA in Buddhist Studies"),
      prog("m_regional_dev_planning", "Master in Regional Development Planning & Management"),
      prog("m_human_rights", "Master's in Human Rights"),
      prog("msw", "Master of Social Work (MSW)"),
      prog("mpa", "Master of Public Administration (MPA)"),
    ],
    education: [
      prog("med", "MEd"),
      prog("med_leadership_mgmt", "MEd in Leadership & Management"),
      prog("med_math", "MEd Math"),
    ],
    law: [
      prog("llm", "LLM"),
      prog("m_conflict_ihl", "Master's Degree in Conflict & International Humanitarian Law"),
    ],
    science: [
      prog("msc_general", "MSc"),
      prog("msc_environmental_mgmt", "MSc Environmental Science / Management"),
      prog("msc_biotechnology", "MSc Biotechnology"),
      prog("msc_life_science", "MSc Life Science"),
      prog("msc_nrm", "MSc Natural Resources Management"),
      prog("msc_water_resource_mgmt", "MSc Interdisciplinary Water Resource Management"),
    ],
    hospitality_development: [
      prog("mttm", "Master of Tourism Studies (MTTM)"),
      prog("mhhm", "Master of Hotel & Hospitality Management (MHHM)"),
      prog("m_sustainable_dev", "Master in Sustainable Development"),
    ],
  },
};

// Flattened, ID-addressable program catalog — the array code should
// actually import. Every entry carries levelId + facultyId, and
// typicalDurationYears is guaranteed non-null (defaulted per level if the
// program didn't specify its own).
export const PROGRAMS = Object.entries(RAW_LEVEL_FACULTY_PROGRAMS).flatMap(([levelId, faculties]) =>
  Object.entries(faculties).flatMap(([facultyId, programs]) =>
    programs.map((program) => ({
      ...program,
      levelId,
      facultyId,
      typicalDurationYears: program.typicalDurationYears ?? DEFAULT_DURATION_BY_LEVEL[levelId] ?? null,
    })),
  ),
);

export const PROGRAMS_BY_ID = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

// ─── Program Offerings (Program × University join) ──────────────────────────
// This is where university-specific facts belong: does this university
// actually offer this program, what duration/degree title do THEY use, is
// it currently accepting admissions. Seed data below is illustrative for a
// handful of well-known combinations — treat this as a starting fixture,
// not a complete dataset. In production this table is what an admin CRUD
// (see models/ProgramOffering.js) manages, keyed by (programId, universityId).
export const PROGRAM_OFFERINGS = [
  { programId: "be_civil", universityId: "tu", durationYears: 4 },
  { programId: "be_civil", universityId: "purbanchal", durationYears: 4 },
  { programId: "be_civil", universityId: "pu", durationYears: 4 },
  { programId: "bsc_csit", universityId: "tu", durationYears: 4 },
  { programId: "bsc_csit", universityId: "pu", durationYears: 4 },
  { programId: "mbbs", universityId: "tu", durationYears: 5.5 },
  { programId: "mbbs", universityId: "ku", durationYears: 5.5 },
  { programId: "bba", universityId: "tu", durationYears: 4 },
  { programId: "bba", universityId: "pu", durationYears: 4 },
  { programId: "bba", universityId: "ku", durationYears: 4 },
  // Extend via admin CRUD / seed script rather than hand-editing this file.
];

// ─── Helper accessors ────────────────────────────────────────────────────────

// Faculties available for a given level. Returns [] if the level has no
// faculty step (e.g. "see", "primary").
export function getFacultiesForLevel(levelId) {
  return FACULTIES.filter((f) => f.appliesToLevels.includes(levelId));
}

// Programs available for a given level + faculty combo.
export function getProgramsForFaculty(levelId, facultyId) {
  return PROGRAMS.filter((p) => p.levelId === levelId && p.facultyId === facultyId);
}

// Whether the University/Affiliation field should be shown for a level.
export function isUniversityAffiliatedLevel(levelId) {
  return STUDY_LEVELS_BY_ID[levelId]?.universityAffiliated ?? false;
}

// Human label for the governing-body caption under the level dropdown.
export function getGoverningBodyLabel(levelId) {
  const body = STUDY_LEVELS_BY_ID[levelId]?.governingBody;
  return GOVERNING_BODY_LABELS[body] || null;
}

export function findProgramById(programId) {
  return PROGRAMS_BY_ID[programId] || null;
}

export function findUniversityById(universityId) {
  return UNIVERSITIES_BY_ID[universityId] || null;
}

export function findFacultyById(facultyId) {
  return FACULTIES_BY_ID[facultyId] || null;
}

// Universities that actually offer a given program, per PROGRAM_OFFERINGS.
export function getUniversitiesOfferingProgram(programId) {
  return PROGRAM_OFFERINGS.filter((o) => o.programId === programId).map((o) => ({
    ...findUniversityById(o.universityId),
    durationYears: o.durationYears,
  }));
}

// Simple case-insensitive search across program name + aliases — handy for
// autocomplete/search boxes. Returns matching program objects.
export function searchPrograms(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PROGRAMS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.aliases.some((a) => a.toLowerCase().includes(q)),
  );
}