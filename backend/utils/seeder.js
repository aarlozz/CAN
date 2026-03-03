// seeder.js — Seeds Nepal location data (Province → District → Municipality)
//
// Run once after setting up the DB:
//   cd backend && node utils/seeder.js
//
// Options:
//   node utils/seeder.js          — seeds all data (skips if already seeded)
//   node utils/seeder.js --force  — drops existing data and re-seeds
//   node utils/seeder.js --clear  — drops location data only (no re-seed)

const mongoose   = require('mongoose');
const Province     = require('../models/Province');
const District     = require('../models/District');
const Municipality = require('../models/Municipality');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION DATA — Nepal's official administrative divisions
// ─────────────────────────────────────────────────────────────────────────────

const PROVINCES = [
  { provinceName: 'Koshi Province',         provinceCode: 'P1' },
  { provinceName: 'Madhesh Province',        provinceCode: 'P2' },
  { provinceName: 'Bagmati Province',        provinceCode: 'P3' },
  { provinceName: 'Gandaki Province',        provinceCode: 'P4' },
  { provinceName: 'Lumbini Province',        provinceCode: 'P5' },
  { provinceName: 'Karnali Province',        provinceCode: 'P6' },
  { provinceName: 'Sudurpashchim Province',  provinceCode: 'P7' },
];

// Districts keyed by provinceCode
const DISTRICTS_BY_PROVINCE = {
  P1: [
    'Taplejung','Panchthar','Ilam','Jhapa','Morang','Sunsari',
    'Dhankuta','Terhathum','Sankhuwasabha','Bhojpur',
    'Solukhumbu','Okhaldhunga','Khotang','Udayapur',
  ],
  P2: [
    'Saptari','Siraha','Dhanusha','Mahottari',
    'Sarlahi','Rautahat','Bara','Parsa',
  ],
  P3: [
    'Sindhuli','Ramechhap','Dolakha','Sindhupalchok','Kavrepalanchok',
    'Lalitpur','Bhaktapur','Kathmandu','Nuwakot','Rasuwa',
    'Dhading','Makwanpur','Chitwan',
  ],
  P4: [
    'Gorkha','Manang','Mustang','Myagdi','Kaski',
    'Lamjung','Tanahu','Nawalpur','Syangja','Parbat','Baglung',
  ],
  P5: [
    'Rukum East','Rolpa','Pyuthan','Gulmi','Arghakhanchi','Palpa',
    'Nawalparasi East','Rupandehi','Kapilvastu','Dang','Banke','Bardiya',
  ],
  P6: [
    'Dolpa','Mugu','Humla','Jumla','Kalikot',
    'Dailekh','Jajarkot','Rukum West','Salyan','Surkhet',
  ],
  P7: [
    'Bajura','Bajhang','Achham','Doti','Kailali',
    'Kanchanpur','Dadeldhura','Baitadi','Darchula',
  ],
};

// Key municipalities for major districts (selected for CAN scholarship relevance)
// Format: { districtName, municipalities: [{ name, type }] }
const MUNICIPALITIES_BY_DISTRICT = [
  // ── Kathmandu ───────────────────────────────────────────────────────────
  {
    districtName: 'Kathmandu',
    municipalities: [
      { municipalityName: 'Kathmandu Metropolitan City',  municipalityType: 'Metropolitan' },
      { municipalityName: 'Kirtipur Municipality',        municipalityType: 'Municipality' },
      { municipalityName: 'Chandragiri Municipality',     municipalityType: 'Municipality' },
      { municipalityName: 'Dakshinkali Municipality',     municipalityType: 'Municipality' },
      { municipalityName: 'Budhanilkantha Municipality',  municipalityType: 'Municipality' },
      { municipalityName: 'Tokha Municipality',           municipalityType: 'Municipality' },
      { municipalityName: 'Tarakeshwar Municipality',     municipalityType: 'Municipality' },
      { municipalityName: 'Nagarjun Municipality',        municipalityType: 'Municipality' },
      { municipalityName: 'Kageshwori Manohara Municipality', municipalityType: 'Municipality' },
      { municipalityName: 'Gokarneshwar Municipality',    municipalityType: 'Municipality' },
      { municipalityName: 'Shankharapur Municipality',    municipalityType: 'Municipality' },
    ],
  },
  // ── Lalitpur ────────────────────────────────────────────────────────────
  {
    districtName: 'Lalitpur',
    municipalities: [
      { municipalityName: 'Lalitpur Metropolitan City',   municipalityType: 'Metropolitan' },
      { municipalityName: 'Godawari Municipality',        municipalityType: 'Municipality' },
      { municipalityName: 'Mahalaxmi Municipality',       municipalityType: 'Municipality' },
      { municipalityName: 'Bagmati Rural Municipality',   municipalityType: 'Rural Municipality' },
      { municipalityName: 'Konjyosom Rural Municipality', municipalityType: 'Rural Municipality' },
    ],
  },
  // ── Bhaktapur ───────────────────────────────────────────────────────────
  {
    districtName: 'Bhaktapur',
    municipalities: [
      { municipalityName: 'Bhaktapur Municipality',       municipalityType: 'Municipality' },
      { municipalityName: 'Madhyapur Thimi Municipality', municipalityType: 'Municipality' },
      { municipalityName: 'Changunarayan Municipality',   municipalityType: 'Municipality' },
      { municipalityName: 'Suryabinayak Municipality',    municipalityType: 'Municipality' },
    ],
  },
  // ── Chitwan ─────────────────────────────────────────────────────────────
  {
    districtName: 'Chitwan',
    municipalities: [
      { municipalityName: 'Bharatpur Metropolitan City',  municipalityType: 'Metropolitan' },
      { municipalityName: 'Ratnanagar Municipality',      municipalityType: 'Municipality' },
      { municipalityName: 'Khairahani Municipality',      municipalityType: 'Municipality' },
      { municipalityName: 'Madi Municipality',            municipalityType: 'Municipality' },
    ],
  },
  // ── Kaski (Pokhara) ─────────────────────────────────────────────────────
  {
    districtName: 'Kaski',
    municipalities: [
      { municipalityName: 'Pokhara Metropolitan City',    municipalityType: 'Metropolitan' },
      { municipalityName: 'Annapurna Rural Municipality', municipalityType: 'Rural Municipality' },
      { municipalityName: 'Madi Rural Municipality',      municipalityType: 'Rural Municipality' },
      { municipalityName: 'Machhapuchchhre Rural Municipality', municipalityType: 'Rural Municipality' },
    ],
  },
  // ── Jhapa ───────────────────────────────────────────────────────────────
  {
    districtName: 'Jhapa',
    municipalities: [
      { municipalityName: 'Mechinagar Municipality',      municipalityType: 'Municipality' },
      { municipalityName: 'Bhadrapur Municipality',       municipalityType: 'Municipality' },
      { municipalityName: 'Damak Municipality',           municipalityType: 'Municipality' },
      { municipalityName: 'Birtamod Municipality',        municipalityType: 'Municipality' },
      { municipalityName: 'Kankai Municipality',          municipalityType: 'Municipality' },
    ],
  },
  // ── Morang ──────────────────────────────────────────────────────────────
  {
    districtName: 'Morang',
    municipalities: [
      { municipalityName: 'Biratnagar Metropolitan City', municipalityType: 'Metropolitan' },
      { municipalityName: 'Urlabari Municipality',        municipalityType: 'Municipality' },
      { municipalityName: 'Letang Municipality',          municipalityType: 'Municipality' },
      { municipalityName: 'Sundarharaicha Municipality',  municipalityType: 'Municipality' },
    ],
  },
  // ── Sunsari ─────────────────────────────────────────────────────────────
  {
    districtName: 'Sunsari',
    municipalities: [
      { municipalityName: 'Inaruwa Municipality',         municipalityType: 'Municipality' },
      { municipalityName: 'Dharan Sub-Metropolitan City', municipalityType: 'Sub-Metropolitan' },
      { municipalityName: 'Itahari Sub-Metropolitan City', municipalityType: 'Sub-Metropolitan' },
      { municipalityName: 'Duhabi Municipality',          municipalityType: 'Municipality' },
    ],
  },
  // ── Rupandehi ───────────────────────────────────────────────────────────
  {
    districtName: 'Rupandehi',
    municipalities: [
      { municipalityName: 'Butwal Sub-Metropolitan City', municipalityType: 'Sub-Metropolitan' },
      { municipalityName: 'Siddharthanagar Municipality', municipalityType: 'Municipality' },
      { municipalityName: 'Tilottama Municipality',       municipalityType: 'Municipality' },
    ],
  },
  // ── Surkhet ─────────────────────────────────────────────────────────────
  {
    districtName: 'Surkhet',
    municipalities: [
      { municipalityName: 'Birendranagar Municipality',   municipalityType: 'Municipality' },
      { municipalityName: 'Bheriganga Municipality',      municipalityType: 'Municipality' },
      { municipalityName: 'Gurbhakot Municipality',       municipalityType: 'Municipality' },
    ],
  },
  // ── Kailali ─────────────────────────────────────────────────────────────
  {
    districtName: 'Kailali',
    municipalities: [
      { municipalityName: 'Dhangadhi Sub-Metropolitan City', municipalityType: 'Sub-Metropolitan' },
      { municipalityName: 'Tikapur Municipality',         municipalityType: 'Municipality' },
      { municipalityName: 'Lamkichuha Municipality',      municipalityType: 'Municipality' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function seed(force = false) {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // ── Check if already seeded ──────────────────────────────────────────────
  if (!force) {
    const existingCount = await Province.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  Already seeded (${existingCount} provinces found). Use --force to re-seed.`);
      await mongoose.disconnect();
      return;
    }
  }

  // ── Clear existing location data ─────────────────────────────────────────
  console.log('🗑  Clearing existing location data...');
  await Promise.all([
    Province.deleteMany({}),
    District.deleteMany({}),
    Municipality.deleteMany({}),
  ]);

  // ── Seed Provinces ───────────────────────────────────────────────────────
  console.log('📍 Seeding provinces...');
  const insertedProvinces = await Province.insertMany(PROVINCES);
  console.log(`   ✅ ${insertedProvinces.length} provinces inserted`);

  // Build a lookup map: provinceCode → { _id, provinceName }
  const provinceMap = {};
  insertedProvinces.forEach((p) => {
    provinceMap[p.provinceCode] = { _id: p._id, provinceName: p.provinceName };
  });

  // ── Seed Districts ───────────────────────────────────────────────────────
  console.log('🗺  Seeding districts...');
  const districtDocs = [];
  for (const [code, districtNames] of Object.entries(DISTRICTS_BY_PROVINCE)) {
    const prov = provinceMap[code];
    districtNames.forEach((name) => {
      districtDocs.push({
        provinceId:   prov._id,
        provinceName: prov.provinceName,
        districtName: name,
      });
    });
  }
  const insertedDistricts = await District.insertMany(districtDocs);
  console.log(`   ✅ ${insertedDistricts.length} districts inserted`);

  // Build a lookup map: districtName → { _id, districtName }
  const districtMap = {};
  insertedDistricts.forEach((d) => {
    districtMap[d.districtName] = { _id: d._id, districtName: d.districtName };
  });

  // ── Seed Municipalities ──────────────────────────────────────────────────
  console.log('🏙  Seeding municipalities...');
  const municipalityDocs = [];
  for (const entry of MUNICIPALITIES_BY_DISTRICT) {
    const dist = districtMap[entry.districtName];
    if (!dist) {
      console.warn(`   ⚠️  District not found: ${entry.districtName} — skipping`);
      continue;
    }
    entry.municipalities.forEach((m) => {
      municipalityDocs.push({
        districtId:       dist._id,
        districtName:     dist.districtName,
        municipalityName: m.municipalityName,
        municipalityType: m.municipalityType,
      });
    });
  }
  const insertedMunicipalities = await Municipality.insertMany(municipalityDocs);
  console.log(`   ✅ ${insertedMunicipalities.length} municipalities inserted`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉 Seeding complete!');
  console.log(`   Provinces:     ${insertedProvinces.length}`);
  console.log(`   Districts:     ${insertedDistricts.length}`);
  console.log(`   Municipalities:${insertedMunicipalities.length}`);

  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function clear() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    Province.deleteMany({}),
    District.deleteMany({}),
    Municipality.deleteMany({}),
  ]);
  console.log('🗑  All location data cleared');
  await mongoose.disconnect();
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
const args  = process.argv.slice(2);
const force = args.includes('--force');
const clearOnly = args.includes('--clear');

(async () => {
  try {
    if (clearOnly) {
      await clear();
    } else {
      await seed(force);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
})();