import test from "node:test";
import assert from "node:assert/strict";

import {
  validateEligibilityExtras,
  buildCoverage,
  buildSearchClauses,
  buildEligibility,
  VALID_TYPES,
  VALID_LEVELS,
  VALID_ETHNIC_CATEGORIES,
} from "../services/scholarshipService.js";

import {
  escapeRegex,
  buildSnapshot,
} from "../services/applicationService.js";

import { AppError } from "../utils/AppError.js";

// ─── 1. AppError Tests ────────────────────────────────────────────────────────
test("AppError: sets message and custom status code", () => {
  const err = new AppError("Not Found Test", 404);
  assert.equal(err.message, "Not Found Test");
  assert.equal(err.status, 404);
  assert.equal(err.name, "AppError");
});

test("AppError: defaults to status 400", () => {
  const err = new AppError("Bad Request");
  assert.equal(err.status, 400);
});

// ─── 2. Scholarship Service Validation Tests ──────────────────────────────────
test("validateEligibilityExtras: passes with valid data", () => {
  const validData = {
    minGPA: 3.5,
    entranceExamName: "IOE",
    minEntranceScore: 75,
    minAge: 18,
    maxAge: 25,
    ethnicCategory: "general",
    minAttendancePercent: 80,
  };
  const errors = validateEligibilityExtras(validData);
  assert.deepEqual(errors, []);
});

test("validateEligibilityExtras: rejects setting both minGPA and minPercentage", () => {
  const errors = validateEligibilityExtras({
    minGPA: 3.5,
    minPercentage: 80,
  });
  assert.ok(errors.some((e) => e.includes("Set either minGPA or minPercentage")));
});

test("validateEligibilityExtras: rejects minGPA out of range (0 to 5)", () => {
  const errorsNegative = validateEligibilityExtras({ minGPA: -1 });
  const errorsHigh = validateEligibilityExtras({ minGPA: 5.5 });
  assert.ok(errorsNegative.some((e) => e.includes("between 0 and 5")));
  assert.ok(errorsHigh.some((e) => e.includes("between 0 and 5")));
});

test("validateEligibilityExtras: rejects minPercentage out of range (0 to 100)", () => {
  const errors = validateEligibilityExtras({ minPercentage: 110 });
  assert.ok(errors.some((e) => e.includes("between 0 and 100")));
});

test("validateEligibilityExtras: rejects minAge > maxAge", () => {
  const errors = validateEligibilityExtras({ minAge: 30, maxAge: 20 });
  assert.ok(errors.some((e) => e.includes("minAge cannot be greater than maxAge")));
});

test("validateEligibilityExtras: requires entranceExamName when minEntranceScore is provided", () => {
  const errors = validateEligibilityExtras({ minEntranceScore: 50 });
  assert.ok(errors.some((e) => e.includes("entranceExamName is required")));
});

test("validateEligibilityExtras: validates ethnicCategory enum", () => {
  const errors = validateEligibilityExtras({ ethnicCategory: "invalid_category" });
  assert.ok(errors.some((e) => e.includes("Invalid ethnicCategory")));
});

// ─── 3. Coverage Calculations (Fee / Amount / Percentage Triangle) ───────────
test("buildCoverage: derives amount from fee and percentage", () => {
  const res = buildCoverage({
    totalProgramFeeNpr: 100000,
    percentage: 50,
  });
  assert.equal(res.amountNpr, 50000);
  assert.equal(res.totalProgramFeeNpr, 100000);
  assert.equal(res.percentage, 50);
});

test("buildCoverage: derives percentage from fee and amount", () => {
  const res = buildCoverage({
    totalProgramFeeNpr: 200000,
    amountNpr: 50000,
  });
  assert.equal(res.percentage, 25);
  assert.equal(res.amountNpr, 50000);
  assert.equal(res.totalProgramFeeNpr, 200000);
});

test("buildCoverage: derives fee from amount and percentage", () => {
  const res = buildCoverage({
    amountNpr: 50000,
    percentage: 50,
  });
  assert.equal(res.totalProgramFeeNpr, 100000);
  assert.equal(res.amountNpr, 50000);
  assert.equal(res.percentage, 50);
});

test("buildCoverage: preserves valid scholarshipType2", () => {
  const res = buildCoverage({
    scholarshipType2: "full_tuition",
    totalProgramFeeNpr: 100000,
  });
  assert.equal(res.scholarshipType2, "full_tuition");
});

// ─── 4. Search Clauses Builder Tests ──────────────────────────────────────────
test("buildSearchClauses: correctly splits terms and creates $or clauses", () => {
  const clauses = buildSearchClauses("Bachelors Computer");
  assert.equal(clauses.length, 2);
  // Plural stripped: Bachelors -> Bachelor
  assert.ok(clauses[0].$or.some((c) => c.scholarshipTitle?.$regex === "Bachelor"));
  assert.ok(clauses[1].$or.some((c) => c.scholarshipTitle?.$regex === "Computer"));
});

// ─── 5. Eligibility Criteria Builder Tests ────────────────────────────────────
test("buildEligibility: sets safe defaults for gender, isNepali, hasDisability", () => {
  const built = buildEligibility({});
  assert.equal(built.gender, "any");
  assert.equal(built.isNepali, true);
  assert.equal(built.hasDisability, false);
});

test("buildEligibility: parses numbers and trims invalid enums", () => {
  const built = buildEligibility({
    minGPA: "3.8",
    minAge: "21",
    targetLevel: "bachelor",
    gender: "female",
  });
  assert.equal(built.minGPA, 3.8);
  assert.equal(built.minAge, 21);
  assert.equal(built.targetLevel, "bachelor");
  assert.equal(built.gender, "female");
});

// ─── 6. Application Service Tests ─────────────────────────────────────────────
test("escapeRegex: escapes special regex characters", () => {
  const input = "test (string) [with] +special? .chars*";
  const escaped = escapeRegex(input);
  assert.equal(escaped, "test \\(string\\) \\[with\\] \\+special\\? \\.chars\\*");
});

test("buildSnapshot: freezes student profile data accurately", () => {
  const student = {
    personal_info: {
      gender: "Female",
      dob: new Date("2002-05-15"),
      phone: "9800000000",
    },
    address: {
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu Metro",
      street: "New Road",
    },
    educationInfo: {
      schoolName: "Test High School",
      schoolType: "Government",
      currentEducationLevel: "see",
    },
    reservationInfo: {
      caste: "Newar",
      hasDisability: false,
      disabilityType: "",
    },
    guardian_info: {
      name: "Guardian Name",
      phone_number: "9811111111",
      relation: "Mother",
    },
  };
  const user = {
    name: "Student Name",
    email: "student@test.com",
  };

  const snapshot = buildSnapshot(student, user);
  assert.equal(snapshot.fullName, "Student Name");
  assert.equal(snapshot.email, "student@test.com");
  assert.equal(snapshot.gender, "Female");
  assert.equal(snapshot.phone, "9800000000");
  assert.equal(snapshot.location.province, "Bagmati");
  assert.equal(snapshot.location.district, "Kathmandu");
  assert.equal(snapshot.location.municipality, "Kathmandu Metro");
  assert.equal(snapshot.educationInfo.schoolName, "Test High School");
  assert.equal(snapshot.guardianInfo.name, "Guardian Name");
  assert.ok(snapshot.snapshotCreatedAt instanceof Date);
});

test("buildSnapshot: falls back to Ref location names if flat strings are missing", () => {
  const student = {
    address: {
      provinceRef: { provinceName: "Gandaki" },
      districtRef: { districtName: "Kaski" },
      municipalityRef: { municipalityName: "Pokhara" },
    },
  };
  const user = { name: "Pokhara Student", email: "pokhara@test.com" };

  const snapshot = buildSnapshot(student, user);
  assert.equal(snapshot.location.province, "Gandaki");
  assert.equal(snapshot.location.district, "Kaski");
  assert.equal(snapshot.location.municipality, "Pokhara");
});
