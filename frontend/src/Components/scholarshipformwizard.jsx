// ScholarshipFormWizard.jsx
//
// 3-step wizard for institutions to post/edit a scholarship, replacing the
// old single-page form. Styled to match the student-facing application
// wizard in ScholarshipDetail.jsx — same red gradient header, StepBar,
// section/review conventions — so posting and applying feel like one product.
//
// Step 1: Core Details, Coverage, Seats, Location Filter
// Step 2: Eligibility Criteria + Required Documents checklist
// Step 3: Review everything filled in + consent checkbox + Submit
//
// This component is presentational/step-state only — the actual form data
// (`form`) and its setters live in the parent (InstitutionalDashboard),
// which already owns handleScholarshipSubmit, buildPayload, etc. This keeps
// a single source of truth for form state.

import { useState } from "react";
import LocationCascade from "./LocationCascade";
import EducationCascade from "./EducationCascade";
import { UNIVERSITIES, COLLEGE_TYPES, STUDY_LEVELS } from "../constants/educationTaxonomy";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Core Details", "Eligibility & Documents", "Review & Submit"];

const ETHNIC_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "dalit", label: "Dalit" },
  { value: "janajati", label: "Janajati" },
  { value: "madhesi", label: "Madhesi" },
  { value: "muslim", label: "Muslim" },
  { value: "backward_region", label: "Backward Region" },
];

// Matches the documentType values the student's application form actually
// uploads against in ScholarshipDetail.jsx (slc_marksheet, plus2_marksheet,
// caste_certificate, disability_certificate, school_certificate, other).
// citizenship/recommendation_letter/income_certificate are included for
// completeness but currently fall under "other" on the student upload side —
// worth wiring dedicated upload fields for these later if institutions use
// them often.
// Exported so the dashboard can look up labels (e.g. when converting a saved
// scholarship's requiredDocuments values back into form state for editing).
export const REQUIRED_DOCUMENT_OPTIONS = [
  { value: "citizenship", label: "Citizenship Certificate" },
  { value: "slc_marksheet", label: "SEE / SLC Marksheet" },
  { value: "plus2_marksheet", label: "+2 Marksheet / Transcript" },
  { value: "caste_certificate", label: "Caste / Janajati Certificate" },
  { value: "disability_certificate", label: "Disability Certificate" },
  { value: "school_certificate", label: "School/College Certificate or TC" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "income_certificate", label: "Family Income Certificate" },
  { value: "other", label: "Other Supporting Document" },
];

// Common Nepal entrance exams by field — "Other" reveals a free-text field.
// Exported so the dashboard can detect, when loading a scholarship for
// editing, whether the saved entranceExamName matches one of these options
// or should be treated as a custom "Other" value.
export const ENTRANCE_EXAMS = [
  "IOE Entrance Exam (Engineering)",
  "CMAT (Management)",
  "MBBS/BDS CEE (Medical)",
  "Nursing Entrance Exam",
  "Bachelor Level Common Entrance (TU)",
  "KU Common Entrance",
  "PU Common Entrance",
  "CTEVT Entrance Exam",
  "Other",
];

const LEVEL_LABEL = Object.fromEntries(STUDY_LEVELS.map((l) => [l.value, l.label]));

// ─── Small building blocks — styled to match ScholarshipDetail.jsx ────────────

function StepBar({ step }) {
  return (
    <div className="flex items-center justify-between mb-10 px-2">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-300 ${done ? "bg-red-500" : "bg-gray-200"}`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300 ${
                done
                  ? "bg-red-500 text-white shadow-md shadow-red-100"
                  : active
                    ? "bg-white border-2 border-red-500 text-red-500 shadow-md"
                    : "bg-white border-2 border-gray-200 text-gray-400"
              }`}
            >
              {done ? "✓" : idx}
            </div>
            <span
              className={`mt-2 text-xs font-medium text-center leading-tight ${
                active ? "text-red-600" : done ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h4 className="text-sm font-bold text-gray-700 mb-4 pt-5 border-t border-gray-100 first:pt-0 first:border-0">
      {children}
    </h4>
  );
}

function ReviewRow({ label, value }) {
  if (value === "" || value == null) return null;
  return (
    <div className="flex px-4 py-2.5 text-sm gap-4">
      <span className="text-gray-400 w-44 shrink-0 font-medium">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
      <div className="bg-gray-100 px-4 py-2.5">
        <h4 className="text-sm font-bold text-gray-700">{title}</h4>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

// ─── Main wizard ────────────────────────────────────────────────────────────────

export default function ScholarshipFormWizard({
  form,
  setForm,
  set, // (field) => (e) => void — simple field setter from parent
  setCoverageField, // (field) => (e) => void — fee/amount/percentage triangle
  setAcademicField, // (field) => (e) => void — GPA/percentage mutual exclusion
  editingId,
  schError,
  schLoading,
  onSubmit, // (e) => void — parent's handleScholarshipSubmit
  onCancel, // () => void — parent's closeForm
  inputCls,
  labelCls,
}) {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  const toggleDocument = (value) => {
    setForm((f) => {
      const current = Array.isArray(f.requiredDocuments) ? f.requiredDocuments : [];
      const has = current.includes(value);
      return {
        ...f,
        requiredDocuments: has
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const isOtherExam = form.entranceExamName === "Other";

  // ── Step navigation with light validation ─────────────────────────────────
  const nextStep = () => {
    setStepError("");
    if (step === 1) {
      if (!form.scholarshipTitle || !form.applicationDeadline) {
        setStepError("Scholarship title and application deadline are required.");
        return;
      }
      if (
        form.remainingSeats !== "" &&
        form.totalSeats !== "" &&
        Number(form.remainingSeats) > Number(form.totalSeats)
      ) {
        setStepError("Remaining seats cannot exceed total seats.");
        return;
      }
    }
    if (step === 2) {
      if (form.minEntranceScore && !form.entranceExamName) {
        setStepError("Please choose the entrance exam if you're setting a minimum score.");
        return;
      }
      if (isOtherExam && form.minEntranceScore && !form.entranceExamOther) {
        setStepError("Please name the entrance exam.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setStepError("");
    setStep((s) => s - 1);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!consentChecked) {
      setStepError(
        "Please confirm you understand this will be sent for provincial admin verification.",
      );
      return;
    }
    onSubmit(e);
  };

  const wasApproved = editingId && form.__originalStatus === "approved";
  const grid2 = "grid grid-cols-1 sm:grid-cols-2 gap-5";

  return (
    <div
      id="scholarship-form"
      className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden scroll-mt-6"
    >
      {/* Gradient header — mirrors the student application form header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 sm:px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-extrabold text-lg">
            {editingId ? "Edit Scholarship" : "New Scholarship"}
          </h2>
          <p className="text-red-100 text-sm mt-0.5">
            Fields marked <span className="text-white">*</span> are required.
          </p>
        </div>
        {editingId && (
          <span className="text-[10px] font-semibold px-2.5 py-1 bg-white/20 text-white border border-white/30 rounded-full shrink-0">
            ✏️ Editing
          </span>
        )}
      </div>

      <div className="px-6 sm:px-8 py-8">
        {wasApproved && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>
              This scholarship is currently <strong>approved</strong> and visible to students.
              Saving changes will send it back to <strong>pending</strong> for re-verification by
              the provincial admin, and it will be temporarily hidden from students until re-approved.
            </span>
          </div>
        )}

        {(stepError || schError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{stepError || schError}</span>
          </div>
        )}

        <StepBar step={step} />

        <form onSubmit={handleFinalSubmit}>
          {/* ── STEP 1: Core Details, Coverage, Seats, Location ──────────────── */}
          {step === 1 && (
            <div className="space-y-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Core Details</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Tell students what this scholarship is and when it closes.
                </p>
              </div>
              <div className={grid2}>
                <div className="sm:col-span-2">
                  <label className={labelCls}>
                    Scholarship Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputCls}
                    required
                    value={form.scholarshipTitle}
                    onChange={set("scholarshipTitle")}
                    placeholder="e.g. Merit Scholarship 2025"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Describe the scholarship and its purpose..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Terms & Conditions</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    value={form.termsAndConditions}
                    onChange={set("termsAndConditions")}
                    placeholder="Any terms and conditions applicants should be aware of..."
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputCls}
                    type="date"
                    required
                    value={form.applicationDeadline}
                    onChange={set("applicationDeadline")}
                  />
                </div>
              </div>

              <SectionHeading>Coverage</SectionHeading>
              <p className="text-xs text-gray-400 -mt-3 mb-4">
                Fill in any two of the three amounts below and the third fills in automatically.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className={labelCls}>Scholarship Type</label>
                  <select className={inputCls} value={form.scholarshipType2} onChange={set("scholarshipType2")}>
                    <option value="">— Select type —</option>
                    <option value="full_tuition">Full Tuition</option>
                    <option value="partial_tuition">Partial Tuition</option>
                    <option value="merit_based">Merit Based</option>
                    <option value="need_based">Need Based</option>
                    <option value="disability">Disability</option>
                    <option value="gender">Gender</option>
                    <option value="ethnic">Ethnic</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>
                    Total Program Fee (NPR){" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.totalProgramFeeNpr}
                    onChange={setCoverageField("totalProgramFeeNpr")}
                    placeholder="e.g. 800000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Amount (NPR)</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.amountNpr}
                    onChange={setCoverageField("amountNpr")}
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Coverage Percentage (%)</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    max="100"
                    value={form.percentage}
                    onChange={setCoverageField("percentage")}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>

              <SectionHeading>Seats</SectionHeading>
              <div className={grid2}>
                <div>
                  <label className={labelCls}>Total Seats</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    value={form.totalSeats}
                    onChange={set("totalSeats")}
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className={labelCls}>Remaining / Available Seats</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.remainingSeats}
                    onChange={set("remainingSeats")}
                    placeholder="Defaults to Total Seats if left empty"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank to default to total seats.</p>
                </div>
              </div>

              <SectionHeading>
                Location Filter{" "}
                <span className="font-normal text-gray-400">(leave blank = open to all)</span>
              </SectionHeading>
              <LocationCascade
                idMode="name"
                province={form.provinceName}
                district={form.districtName}
                municipality={form.municipalityName}
                onChange={({ province, district, municipality }) =>
                  setForm((f) => ({
                    ...f,
                    provinceName: province,
                    districtName: district,
                    municipalityName: municipality,
                  }))
                }
              />
            </div>
          )}

          {/* ── STEP 2: Eligibility + Documents ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Eligibility & Documents</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Narrow down who can apply and what they'll need to submit.
                </p>
              </div>

              <EducationCascade
                level={form.targetLevel}
                faculty={form.targetFaculty}
                program={form.degreeProgram}
                onChange={({ level, faculty, program }) =>
                  setForm((f) => ({
                    ...f,
                    targetLevel: level,
                    targetFaculty: faculty,
                    degreeProgram: program,
                  }))
                }
              />

              <div className={grid2 + " mt-5"}>
                <div>
                  <label className={labelCls}>University / Affiliation</label>
                  <select className={inputCls} value={form.university} onChange={set("university")}>
                    <option value="">— Any university —</option>
                    {UNIVERSITIES.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>College Type</label>
                  <select className={inputCls} value={form.collegeType} onChange={set("collegeType")}>
                    <option value="">— Any college type —</option>
                    {COLLEGE_TYPES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>
                    Specialization{" "}
                    <span className="text-gray-400 font-normal">
                      (optional — e.g. a research focus within the program)
                    </span>
                  </label>
                  <input
                    className={inputCls}
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="e.g. Machine Learning, Structural Engineering"
                  />
                </div>

                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={form.gender} onChange={set("gender")}>
                    <option value="any">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>
                    Category <span className="text-gray-400 font-normal">(optional quota)</span>
                  </label>
                  <select className={inputCls} value={form.ethnicCategory} onChange={set("ethnicCategory")}>
                    <option value="">— Any —</option>
                    {ETHNIC_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    Minimum GPA (previous exam) <span className="text-gray-400 font-normal">(0–4)</span>
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={form.minGPA}
                    onChange={setAcademicField("minGPA")}
                    placeholder="e.g. 3.2"
                  />
                </div>
                <div>
                  <label className={labelCls}>Minimum Percentage (previous exam)</label>
                  <input
                    className={inputCls}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.minPercentage}
                    onChange={setAcademicField("minPercentage")}
                    placeholder="e.g. 60"
                  />
                </div>

                {/* Entrance exam — dropdown instead of free text, with "Other" fallback */}
                <div>
                  <label className={labelCls}>
                    Entrance Exam{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.entranceExamName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((f) => ({
                        ...f,
                        entranceExamName: val,
                        entranceExamOther: val === "Other" ? f.entranceExamOther : "",
                      }));
                    }}
                  >
                    <option value="">— No entrance exam required —</option>
                    {ENTRANCE_EXAMS.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                  {isOtherExam && (
                    <input
                      className={inputCls + " mt-2"}
                      value={form.entranceExamOther}
                      onChange={set("entranceExamOther")}
                      placeholder="Name the exam"
                    />
                  )}
                </div>
                <div>
                  <label className={labelCls}>Minimum Entrance Score</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.minEntranceScore}
                    onChange={set("minEntranceScore")}
                    placeholder="e.g. 65"
                    disabled={!form.entranceExamName}
                  />
                  {!form.entranceExamName && (
                    <p className="text-xs text-gray-400 mt-1">Select an entrance exam first.</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Additional Requirements</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={2}
                    value={form.additionalRequirements}
                    onChange={set("additionalRequirements")}
                    placeholder="Any other eligibility details..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="isNepali"
                    type="checkbox"
                    className="w-4 h-4 accent-red-500"
                    checked={form.isNepali}
                    onChange={set("isNepali")}
                  />
                  <label htmlFor="isNepali" className="text-sm text-gray-700">
                    Nepali citizens only
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="hasDisability"
                    type="checkbox"
                    className="w-4 h-4 accent-red-500"
                    checked={form.hasDisability}
                    onChange={set("hasDisability")}
                  />
                  <label htmlFor="hasDisability" className="text-sm text-gray-700">
                    For students with disability
                  </label>
                </div>
              </div>

              <SectionHeading>
                Required Documents{" "}
                <span className="font-normal text-gray-400">
                  (tick what applicants must submit)
                </span>
              </SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REQUIRED_DOCUMENT_OPTIONS.map((doc) => {
                  const checked = (form.requiredDocuments || []).includes(doc.value);
                  return (
                    <label
                      key={doc.value}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                        checked
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-red-500"
                        checked={checked}
                        onChange={() => toggleDocument(doc.value)}
                      />
                      {doc.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: Review + Consent ──────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Review Before Submitting</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Double check everything below. You can still go back and edit any step.
                </p>
              </div>

              <ReviewSection title="Core Details">
                <ReviewRow label="Title" value={form.scholarshipTitle} />
                <ReviewRow label="Description" value={form.description} />
                <ReviewRow label="Terms & Conditions" value={form.termsAndConditions} />
                <ReviewRow label="Application Deadline" value={form.applicationDeadline} />
              </ReviewSection>

              <ReviewSection title="Coverage & Seats">
                <ReviewRow
                  label="Scholarship Type"
                  value={form.scholarshipType2 && form.scholarshipType2.replace("_", " ")}
                />
                <ReviewRow
                  label="Total Program Fee"
                  value={form.totalProgramFeeNpr && `NPR ${Number(form.totalProgramFeeNpr).toLocaleString()}`}
                />
                <ReviewRow
                  label="Amount"
                  value={form.amountNpr && `NPR ${Number(form.amountNpr).toLocaleString()}`}
                />
                <ReviewRow label="Percentage" value={form.percentage && `${form.percentage}%`} />
                <ReviewRow label="Total Seats" value={form.totalSeats} />
                <ReviewRow label="Remaining Seats" value={form.remainingSeats} />
              </ReviewSection>

              <ReviewSection title="Location">
                <ReviewRow label="Province" value={form.provinceName || "Open to all"} />
                <ReviewRow label="District" value={form.districtName} />
                <ReviewRow label="Municipality" value={form.municipalityName} />
              </ReviewSection>

              <ReviewSection title="Eligibility">
                <ReviewRow label="Target Level" value={LEVEL_LABEL[form.targetLevel] || form.targetLevel} />
                <ReviewRow label="Faculty" value={form.targetFaculty} />
                <ReviewRow label="Degree / Program" value={form.degreeProgram} />
                <ReviewRow label="University" value={form.university} />
                <ReviewRow
                  label="College Type"
                  value={COLLEGE_TYPES.find((c) => c.value === form.collegeType)?.label}
                />
                <ReviewRow label="Specialization" value={form.subject} />
                <ReviewRow label="Gender" value={form.gender !== "any" ? form.gender : ""} />
                <ReviewRow
                  label="Category"
                  value={
                    form.ethnicCategory &&
                    ETHNIC_CATEGORIES.find((c) => c.value === form.ethnicCategory)?.label
                  }
                />
                <ReviewRow label="Minimum GPA" value={form.minGPA} />
                <ReviewRow label="Minimum Percentage" value={form.minPercentage && `${form.minPercentage}%`} />
                <ReviewRow
                  label="Entrance Exam"
                  value={isOtherExam ? form.entranceExamOther : form.entranceExamName}
                />
                <ReviewRow label="Minimum Entrance Score" value={form.minEntranceScore} />
                <ReviewRow label="Additional Requirements" value={form.additionalRequirements} />
                <ReviewRow label="Nepali citizens only" value={form.isNepali ? "Yes" : "No"} />
                <ReviewRow label="For students with disability" value={form.hasDisability ? "Yes" : "No"} />
              </ReviewSection>

              <ReviewSection title="Required Documents">
                {(form.requiredDocuments || []).length > 0 ? (
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {form.requiredDocuments.map((v) => (
                      <span
                        key={v}
                        className="text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full"
                      >
                        {REQUIRED_DOCUMENT_OPTIONS.find((d) => d.value === v)?.label || v}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-400">No documents marked as required.</p>
                )}
              </ReviewSection>

              {/* Consent — styled like the declaration block in ScholarshipDetail.jsx */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-red-500"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                  />
                  <span className="text-sm text-blue-800 leading-relaxed">
                    <span className="font-semibold block mb-1">Declaration</span>
                    I confirm the information above is accurate and I understand this scholarship
                    will be sent to the <strong>provincial admin for verification</strong>. It will
                    not be visible to students until it is approved.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={schLoading || !consentChecked}
                className="px-8 py-2.5 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {schLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {schLoading
                  ? editingId
                    ? "Saving…"
                    : "Submitting…"
                  : editingId
                    ? "✓ Save & Send for Re-verification"
                    : "✓ Submit for Verification"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}