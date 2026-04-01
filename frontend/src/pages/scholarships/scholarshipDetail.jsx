import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const readFileAsBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const STEP_LABELS = ["Personal Info", "Academic Records", "Documents", "Review & Submit"];

const DOCUMENT_TYPES = [
  { value: "admit_card",              label: "Admit Card" },
  { value: "slc_marksheet",           label: "SEE / SLC Marksheet" },
  { value: "plus2_gradesheet",        label: "+2 Gradesheet" },
  { value: "plus2_marksheet",         label: "+2 Marksheet" },
  { value: "gradesheet",              label: "Gradesheet (Other)" },
  { value: "caste_certificate",       label: "Caste Certificate" },
  { value: "disability_certificate",  label: "Disability Certificate" },
  { value: "school_certificate",      label: "School Certificate / TC" },
  { value: "certificate",             label: "Other Certificate" },
  { value: "other",                   label: "Other Document" },
];

const RESERVATION_CATEGORIES = [
  { value: "government_school",  label: "Government School Student" },
  { value: "community_school",   label: "Community School Student" },
  { value: "caste",              label: "Caste-Based Reservation" },
  { value: "disability",         label: "Person with Disability" },
  { value: "gender",             label: "Gender-Based (Female/Other)" },
  { value: "other",              label: "Other" },
];

const NEPAL_PROVINCES = [
  "Koshi Province", "Madhesh Province", "Bagmati Province",
  "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province",
];

const EDUCATION_LEVELS = ["SEE", "+2", "Bachelors", "Masters", "Other"];
const SCHOOL_TYPES = ["Government", "Community", "Private", "Other"];

// ─── Sub-component: Step Progress Bar ──────────────────────────────────────
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
                className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-300 ${
                  done ? "bg-red-500" : "bg-gray-200"
                }`}
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

// ─── Sub-component: File Upload Box ────────────────────────────────────────
function FileBox({ label, accept, required, hint, onChange, value, preview }) {
  const inputRef = useRef();

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all group ${
          value
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onChange}
        />
        {preview && value ? (
          <div className="flex items-center gap-3">
            <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
            <div>
              <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{value.name}</p>
              <p className="text-xs text-gray-400">{(value.size / 1024).toFixed(1)} KB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        ) : value ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
              {value.name?.split(".").pop()?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{value.name}</p>
              <p className="text-xs text-gray-400">{(value.size / 1024).toFixed(1)} KB · Click to change</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 text-gray-400 group-hover:text-red-400 transition-colors">
            <svg className="w-7 h-7 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs mt-0.5">{accept?.replace(/,/g, " / ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ScholarshipDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const [applying, setApplying]       = useState(false);
  const [step, setStep]               = useState(1);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError]   = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  // ── Form State ─────────────────────────────────────────────────────────────
  const [personal, setPersonal] = useState({
    fullName: "", dob: "", gender: "", phone: "", email: "",
    province: "", district: "", municipality: "", ward: "", street: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
  });

  const [academic, setAcademic] = useState({
    applicationType: "merit",
    schoolName: "", schoolType: "",
    currentEducationLevel: "",
    slcGpa: "", slcPercentage: "", slcYear: "",
    plus2Gpa: "", plus2Percentage: "", plus2Year: "", plus2Stream: "",
    entranceScore: "", entranceName: "",
    achievements: "", extraCurricular: "",
    reservationCategory: "",
    caste: "", disabilityType: "", disabilityPercentage: "",
    genderCategory: "", supportingDetails: "",
  });

  const [docs, setDocs] = useState({
    photo:           null, photoPreview: null,
    slcMarksheet:    null,
    plus2Marksheet:  null,
    casteCert:       null,
    disabilityCert:  null,
    schoolCert:      null,
    otherDoc:        null,
  });

  // ── Fetch scholarship ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/scholarship/${id}`)
      .then((res) => {
        const s = res.data.scholarship;
        setScholarship(s);
        if (s?.scholarshipType !== "both") {
          setAcademic((f) => ({ ...f, applicationType: s.scholarshipType }));
        }
      })
      .catch((err) => setError(err.response?.data?.message || "Scholarship not found."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── File handlers ──────────────────────────────────────────────────────────
  const handlePhoto = async (e) => {
    if (!e) { setDocs((d) => ({ ...d, photo: null, photoPreview: null })); return; }
    const file = e.target?.files?.[0];
    if (!file) return;
    const b64 = await readFileAsBase64(file);
    setDocs((d) => ({ ...d, photo: file, photoPreview: b64 }));
  };

  const handleFile = (field) => (e) => {
    if (!e) { setDocs((d) => ({ ...d, [field]: null })); return; }
    const file = e.target?.files?.[0];
    if (file) setDocs((d) => ({ ...d, [field]: file }));
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const nextStep = () => {
    setApplyError("");
    // Basic validation per step
    if (step === 1) {
      if (!personal.fullName || !personal.phone || !personal.province) {
        setApplyError("Please fill in all required personal information fields.");
        return;
      }
    }
    if (step === 2) {
      if (!academic.schoolName || !academic.currentEducationLevel) {
        setApplyError("Please fill in school name and current education level.");
        return;
      }
      if (
        academic.applicationType === "reservation" &&
        !academic.reservationCategory
      ) {
        setApplyError("Please select a reservation category.");
        return;
      }
    }
    if (step === 3) {
      if (!docs.photo) {
        setApplyError("Applicant photo is required.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => { setApplyError(""); setStep((s) => s - 1); };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!token || role !== "student") { navigate("/login"); return; }
    setApplyError("");
    setApplyLoading(true);

    try {
      // Build documents array — filePath uses base64 for photo,
      // filename for others (replace with actual upload URLs in production)
      const documents = [];
      if (docs.photo)
        documents.push({ documentType: "other", documentTitle: "Applicant Photo",
          filePath: docs.photoPreview, fileName: docs.photo.name,
          fileSize: docs.photo.size, mimeType: docs.photo.type });
      if (docs.slcMarksheet)
        documents.push({ documentType: "slc_marksheet", documentTitle: "SEE/SLC Marksheet",
          filePath: docs.slcMarksheet.name, fileName: docs.slcMarksheet.name,
          fileSize: docs.slcMarksheet.size, mimeType: docs.slcMarksheet.type });
      if (docs.plus2Marksheet)
        documents.push({ documentType: "plus2_marksheet", documentTitle: "+2 Marksheet",
          filePath: docs.plus2Marksheet.name, fileName: docs.plus2Marksheet.name,
          fileSize: docs.plus2Marksheet.size, mimeType: docs.plus2Marksheet.type });
      if (docs.casteCert)
        documents.push({ documentType: "caste_certificate", documentTitle: "Caste Certificate",
          filePath: docs.casteCert.name, fileName: docs.casteCert.name,
          fileSize: docs.casteCert.size, mimeType: docs.casteCert.type });
      if (docs.disabilityCert)
        documents.push({ documentType: "disability_certificate", documentTitle: "Disability Certificate",
          filePath: docs.disabilityCert.name, fileName: docs.disabilityCert.name,
          fileSize: docs.disabilityCert.size, mimeType: docs.disabilityCert.type });
      if (docs.schoolCert)
        documents.push({ documentType: "school_certificate", documentTitle: "School Certificate / TC",
          filePath: docs.schoolCert.name, fileName: docs.schoolCert.name,
          fileSize: docs.schoolCert.size, mimeType: docs.schoolCert.type });
      if (docs.otherDoc)
        documents.push({ documentType: "other", documentTitle: "Additional Document",
          filePath: docs.otherDoc.name, fileName: docs.otherDoc.name,
          fileSize: docs.otherDoc.size, mimeType: docs.otherDoc.type });

      const payload = {
        scholarshipId:   id,
        applicationType: academic.applicationType,
        documents,
        ...(academic.applicationType === "merit"
          ? {
              meritDetails: {
                academicRecords: {
                  slcGpa:         Number(academic.slcGpa)         || undefined,
                  slcPercentage:  Number(academic.slcPercentage)  || undefined,
                  plus2Gpa:       Number(academic.plus2Gpa)       || undefined,
                  plus2Percentage:Number(academic.plus2Percentage)|| undefined,
                  entranceScore:  Number(academic.entranceScore)  || undefined,
                },
                achievements:    academic.achievements,
                extraCurricular: academic.extraCurricular,
              },
            }
          : {
              reservationDetails: {
                reservationCategory:  academic.reservationCategory,
                schoolType:           academic.schoolType,
                caste:                academic.caste,
                disabilityType:       academic.disabilityType,
                disabilityPercentage: Number(academic.disabilityPercentage) || undefined,
                genderCategory:       academic.genderCategory,
                supportingDetails:    academic.supportingDetails,
              },
            }
        ),
      };

      await axios.post(`${API}/api/application/apply`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplySuccess(true);
      setApplying(false);
    } catch (err) {
      setApplyError(err.response?.data?.message || "Application failed. Please try again.");
      setStep(4);
    } finally {
      setApplyLoading(false);
    }
  };

  // ─── Loading / Error states ─────────────────────────────────────────────────
  if (loading)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" />
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <Link to="/scholarships" className="text-red-500 hover:underline text-sm">← Back to scholarships</Link>
        </div>
        <Footer />
      </>
    );

  const sch       = scholarship;
  const inst      = sch.institutionId || {};
  const isExpired = new Date(sch.applicationDeadline) < new Date();
  const noSlots   = sch?.financialDetails?.availableSlots === 0;

  // ── Input class helpers ───────────────────────────────────────────────────
  const inp  = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const lbl  = "block text-sm font-semibold text-gray-700 mb-1.5";
  const grid2 = "grid grid-cols-1 sm:grid-cols-2 gap-5";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <Link to="/scholarships" className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 mb-6">
          ← Back to scholarships
        </Link>

        {/* ── Scholarship header card ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mb-3 inline-block capitalize ${
                sch.scholarshipType === "merit"       ? "bg-blue-50 text-blue-700"
                : sch.scholarshipType === "reservation" ? "bg-purple-50 text-purple-700"
                : "bg-green-50 text-green-700"
              }`}>{sch.scholarshipType}</span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{sch.scholarshipTitle}</h1>
              <p className="text-gray-500 mt-1 font-medium">{sch.institutionName}</p>
            </div>

            <div className="shrink-0">
              {isExpired ? (
                <span className="bg-gray-100 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg block">Deadline Passed</span>
              ) : noSlots ? (
                <span className="bg-red-50 text-red-500 text-sm font-medium px-4 py-2 rounded-lg block">No Slots Left</span>
              ) : applySuccess ? (
                <span className="bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg block">✓ Applied!</span>
              ) : !token ? (
                <Link to="/login" className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm block text-center">
                  Login to Apply
                </Link>
              ) : role === "student" ? (
                <button
                  onClick={() => { setApplying((v) => !v); setStep(1); setApplyError(""); }}
                  className={`font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm ${
                    applying ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {applying ? "Cancel Application" : "Apply Now"}
                </button>
              ) : (
                <span className="bg-gray-50 text-gray-400 text-sm font-medium px-4 py-2 rounded-lg block">Institutions cannot apply</span>
              )}
            </div>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
            {[
              { label: "Deadline",     value: new Date(sch.applicationDeadline).toLocaleDateString("en-NP", { day:"numeric", month:"short", year:"numeric" }) },
              { label: "Amount",       value: sch.financialDetails?.amount ? `NPR ${sch.financialDetails.amount.toLocaleString()}` : "—" },
              { label: "Slots Left",   value: sch.financialDetails?.availableSlots ?? "—" },
              { label: "Applications", value: sch.statistics?.totalApplications ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-bold text-gray-900 text-lg">{value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Info cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {sch.description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3 text-base">About this Scholarship</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{sch.description}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3 text-base">Requirements</h2>
            {sch.requirements?.eligibilityCriteria && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Eligibility</p>
                <p className="text-gray-600 text-sm">{sch.requirements.eligibilityCriteria}</p>
              </div>
            )}
            {sch.requirements?.requiredDocuments?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Required Documents</p>
                <ul className="text-gray-600 text-sm space-y-1">
                  {sch.requirements.requiredDocuments.map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sch.requirements?.additionalRequirements && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Additional</p>
                <p className="text-gray-600 text-sm">{sch.requirements.additionalRequirements}</p>
              </div>
            )}
            {!sch.requirements?.eligibilityCriteria && !sch.requirements?.requiredDocuments?.length && (
              <p className="text-gray-400 text-sm">No specific requirements listed.</p>
            )}
          </div>
        </div>

        {/* Institution info */}
        {inst._id && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-3 text-base">Institution</h2>
            <p className="font-semibold text-gray-800">{inst.institutionName}</p>
            {inst.location?.province && (
              <p className="text-sm text-gray-500 mt-1">📍 {inst.location.district}, {inst.location.province}</p>
            )}
            {inst.contactPerson?.email && <p className="text-sm text-gray-500 mt-0.5">✉️ {inst.contactPerson.email}</p>}
            {inst.contactPerson?.phone && <p className="text-sm text-gray-500 mt-0.5">📞 {inst.contactPerson.phone}</p>}
            {inst.website && (
              <a href={inst.website} target="_blank" rel="noopener noreferrer"
                className="text-sm text-red-500 hover:underline mt-1 inline-block">
                🌐 {inst.website}
              </a>
            )}
          </div>
        )}

        {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
        {applySuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-xl font-extrabold text-green-800 mb-2">Application Submitted!</h2>
            <p className="text-green-600 text-sm mb-6">Your application for <strong>{sch.scholarshipTitle}</strong> has been submitted successfully. You will be notified about the status.</p>
            <Link to="/dashboard-student" className="bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors inline-block">
              View My Applications
            </Link>
          </div>
        )}

        {/* ── MULTI-STEP APPLICATION FORM ──────────────────────────────────── */}
        {applying && role === "student" && !applySuccess && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">

            {/* Form header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 sm:px-8 py-5">
              <h2 className="text-white font-extrabold text-lg">Scholarship Application Form</h2>
              <p className="text-red-100 text-sm mt-0.5">{sch.scholarshipTitle} · {sch.institutionName}</p>
            </div>

            <div className="px-6 sm:px-8 py-8">
              <StepBar step={step} />

              {applyError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{applyError}</span>
                </div>
              )}

              {/* ── STEP 1: Personal Information ──────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Personal Information</h3>
                    <p className="text-sm text-gray-500 mb-5">Fill in your personal details as they appear on official documents.</p>
                  </div>

                  <div className={grid2}>
                    <div>
                      <label className={lbl}>Full Name (as per citizenship) <span className="text-red-500">*</span></label>
                      <input className={inp} placeholder="e.g. Ram Bahadur Thapa"
                        value={personal.fullName}
                        onChange={(e) => setPersonal((p) => ({ ...p, fullName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Date of Birth <span className="text-red-500">*</span></label>
                      <input className={inp} type="date"
                        value={personal.dob}
                        onChange={(e) => setPersonal((p) => ({ ...p, dob: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Gender <span className="text-red-500">*</span></label>
                      <select className={inp} value={personal.gender}
                        onChange={(e) => setPersonal((p) => ({ ...p, gender: e.target.value }))}>
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Phone Number <span className="text-red-500">*</span></label>
                      <input className={inp} placeholder="e.g. 98XXXXXXXX" maxLength={10}
                        value={personal.phone}
                        onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={lbl}>Email Address</label>
                      <input className={inp} type="email" placeholder="your@email.com"
                        value={personal.email}
                        onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Permanent Address</h4>
                    <div className={grid2}>
                      <div>
                        <label className={lbl}>Province <span className="text-red-500">*</span></label>
                        <select className={inp} value={personal.province}
                          onChange={(e) => setPersonal((p) => ({ ...p, province: e.target.value }))}>
                          <option value="">Select province</option>
                          {NEPAL_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>District <span className="text-red-500">*</span></label>
                        <input className={inp} placeholder="e.g. Kathmandu"
                          value={personal.district}
                          onChange={(e) => setPersonal((p) => ({ ...p, district: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Municipality / VDC</label>
                        <input className={inp} placeholder="e.g. Kathmandu Metropolitan"
                          value={personal.municipality}
                          onChange={(e) => setPersonal((p) => ({ ...p, municipality: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Ward No.</label>
                        <input className={inp} placeholder="e.g. 10"
                          value={personal.ward}
                          onChange={(e) => setPersonal((p) => ({ ...p, ward: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* Guardian */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Guardian / Parent Information</h4>
                    <div className={grid2}>
                      <div>
                        <label className={lbl}>Guardian Full Name <span className="text-red-500">*</span></label>
                        <input className={inp} placeholder="e.g. Hari Bahadur Thapa"
                          value={personal.guardianName}
                          onChange={(e) => setPersonal((p) => ({ ...p, guardianName: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Relation <span className="text-red-500">*</span></label>
                        <select className={inp} value={personal.guardianRelation}
                          onChange={(e) => setPersonal((p) => ({ ...p, guardianRelation: e.target.value }))}>
                          <option value="">Select relation</option>
                          <option>Father</option><option>Mother</option><option>Uncle</option>
                          <option>Aunt</option><option>Grandfather</option><option>Guardian</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Guardian Phone</label>
                        <input className={inp} placeholder="98XXXXXXXX" maxLength={10}
                          value={personal.guardianPhone}
                          onChange={(e) => setPersonal((p) => ({ ...p, guardianPhone: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Academic Records ──────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Academic Information</h3>
                    <p className="text-sm text-gray-500 mb-5">Provide your academic background and results.</p>
                  </div>

                  {/* Application type (if scholarship accepts both) */}
                  {sch.scholarshipType === "both" && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className={lbl}>Application Type <span className="text-red-500">*</span></label>
                      <div className="flex gap-3 mt-1">
                        {["merit", "reservation"].map((t) => (
                          <button key={t} type="button"
                            onClick={() => setAcademic((f) => ({ ...f, applicationType: t }))}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 capitalize transition-colors ${
                              academic.applicationType === t
                                ? "border-red-500 bg-red-50 text-red-600"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >{t === "merit" ? "🏆 Merit-Based" : "🤝 Reservation-Based"}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* School info */}
                  <div className={grid2}>
                    <div>
                      <label className={lbl}>School / College Name <span className="text-red-500">*</span></label>
                      <input className={inp} placeholder="e.g. Kantipur Secondary School"
                        value={academic.schoolName}
                        onChange={(e) => setAcademic((f) => ({ ...f, schoolName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>School Type <span className="text-red-500">*</span></label>
                      <select className={inp} value={academic.schoolType}
                        onChange={(e) => setAcademic((f) => ({ ...f, schoolType: e.target.value }))}>
                        <option value="">Select type</option>
                        {SCHOOL_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Current Education Level <span className="text-red-500">*</span></label>
                      <select className={inp} value={academic.currentEducationLevel}
                        onChange={(e) => setAcademic((f) => ({ ...f, currentEducationLevel: e.target.value }))}>
                        <option value="">Select level</option>
                        {EDUCATION_LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* SEE/SLC Results */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">SEE / SLC Results</h4>
                    <div className={grid2}>
                      <div>
                        <label className={lbl}>GPA (out of 4.0)</label>
                        <input className={inp} type="number" step="0.01" min="0" max="4" placeholder="e.g. 3.75"
                          value={academic.slcGpa}
                          onChange={(e) => setAcademic((f) => ({ ...f, slcGpa: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Percentage (%)</label>
                        <input className={inp} type="number" step="0.01" min="0" max="100" placeholder="e.g. 82.50"
                          value={academic.slcPercentage}
                          onChange={(e) => setAcademic((f) => ({ ...f, slcPercentage: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Year of Completion</label>
                        <input className={inp} type="number" min="2000" max="2030" placeholder="e.g. 2079"
                          value={academic.slcYear}
                          onChange={(e) => setAcademic((f) => ({ ...f, slcYear: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* +2 Results */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">+2 / Intermediate Results</h4>
                    <div className={grid2}>
                      <div>
                        <label className={lbl}>GPA (out of 4.0)</label>
                        <input className={inp} type="number" step="0.01" min="0" max="4" placeholder="e.g. 3.60"
                          value={academic.plus2Gpa}
                          onChange={(e) => setAcademic((f) => ({ ...f, plus2Gpa: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Percentage (%)</label>
                        <input className={inp} type="number" step="0.01" min="0" max="100" placeholder="e.g. 78.00"
                          value={academic.plus2Percentage}
                          onChange={(e) => setAcademic((f) => ({ ...f, plus2Percentage: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Stream / Faculty</label>
                        <select className={inp} value={academic.plus2Stream}
                          onChange={(e) => setAcademic((f) => ({ ...f, plus2Stream: e.target.value }))}>
                          <option value="">Select stream</option>
                          <option>Science</option><option>Management</option><option>Humanities</option>
                          <option>Education</option><option>Law</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Year of Completion</label>
                        <input className={inp} type="number" min="2000" max="2030" placeholder="e.g. 2081"
                          value={academic.plus2Year}
                          onChange={(e) => setAcademic((f) => ({ ...f, plus2Year: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* Entrance / Merit specific */}
                  {(sch.scholarshipType === "merit" || academic.applicationType === "merit") && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-4">Merit Details</h4>
                      <div className={grid2}>
                        <div>
                          <label className={lbl}>Entrance Exam Score</label>
                          <input className={inp} type="number" step="0.01" placeholder="e.g. 85.00"
                            value={academic.entranceScore}
                            onChange={(e) => setAcademic((f) => ({ ...f, entranceScore: e.target.value }))} />
                        </div>
                        <div>
                          <label className={lbl}>Exam Name</label>
                          <input className={inp} placeholder="e.g. IOE Entrance, IOM Entrance"
                            value={academic.entranceName}
                            onChange={(e) => setAcademic((f) => ({ ...f, entranceName: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Academic Achievements</label>
                          <textarea className={inp + " resize-none"} rows={3}
                            placeholder="Scholarships, awards, academic distinctions, competitions won…"
                            value={academic.achievements}
                            onChange={(e) => setAcademic((f) => ({ ...f, achievements: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Extracurricular Activities</label>
                          <textarea className={inp + " resize-none"} rows={3}
                            placeholder="Sports, cultural activities, community service, leadership roles…"
                            value={academic.extraCurricular}
                            onChange={(e) => setAcademic((f) => ({ ...f, extraCurricular: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reservation specific */}
                  {(sch.scholarshipType === "reservation" || academic.applicationType === "reservation") && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-4">Reservation Details</h4>
                      <div className={grid2}>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Reservation Category <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {RESERVATION_CATEGORIES.map((rc) => (
                              <label key={rc.value}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                                  academic.reservationCategory === rc.value
                                    ? "border-red-400 bg-red-50 text-red-700"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}>
                                <input type="radio" name="resCategory" value={rc.value}
                                  checked={academic.reservationCategory === rc.value}
                                  onChange={(e) => setAcademic((f) => ({ ...f, reservationCategory: e.target.value }))}
                                  className="accent-red-500" />
                                {rc.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {academic.reservationCategory === "caste" && (
                          <div>
                            <label className={lbl}>Caste / Ethnicity</label>
                            <input className={inp} placeholder="e.g. Tamang, Magar, Tharu"
                              value={academic.caste}
                              onChange={(e) => setAcademic((f) => ({ ...f, caste: e.target.value }))} />
                          </div>
                        )}

                        {academic.reservationCategory === "disability" && (
                          <>
                            <div>
                              <label className={lbl}>Type of Disability</label>
                              <select className={inp} value={academic.disabilityType}
                                onChange={(e) => setAcademic((f) => ({ ...f, disabilityType: e.target.value }))}>
                                <option value="">Select type</option>
                                <option>Physical</option><option>Visual</option><option>Hearing</option>
                                <option>Intellectual</option><option>Psychosocial</option><option>Other</option>
                              </select>
                            </div>
                            <div>
                              <label className={lbl}>Disability Percentage (%)</label>
                              <input className={inp} type="number" min="0" max="100" placeholder="e.g. 50"
                                value={academic.disabilityPercentage}
                                onChange={(e) => setAcademic((f) => ({ ...f, disabilityPercentage: e.target.value }))} />
                            </div>
                          </>
                        )}

                        {academic.reservationCategory === "gender" && (
                          <div>
                            <label className={lbl}>Gender Category</label>
                            <select className={inp} value={academic.genderCategory}
                              onChange={(e) => setAcademic((f) => ({ ...f, genderCategory: e.target.value }))}>
                              <option value="">Select</option>
                              <option>Female</option><option>Third Gender</option><option>Other</option>
                            </select>
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <label className={lbl}>Supporting Details / Statement</label>
                          <textarea className={inp + " resize-none"} rows={3}
                            placeholder="Explain your eligibility for this reservation category in detail…"
                            value={academic.supportingDetails}
                            onChange={(e) => setAcademic((f) => ({ ...f, supportingDetails: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Documents ─────────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Document Uploads</h3>
                    <p className="text-sm text-gray-500 mb-1">Upload clear, legible copies. Accepted formats: PDF, JPG, PNG.</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex gap-2">
                      <span>⚠️</span>
                      <span>Make sure all documents are valid, government-issued, and not expired. False documents will result in disqualification.</span>
                    </div>
                  </div>

                  {/* Photo */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Applicant Photograph</h4>
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className="shrink-0">
                        {docs.photoPreview ? (
                          <img src={docs.photoPreview} alt="Preview"
                            className="w-28 h-36 object-cover rounded-xl border-2 border-green-300 shadow-sm" />
                        ) : (
                          <div className="w-28 h-36 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs text-center">No photo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <FileBox
                          label="Passport-size Photo"
                          accept=".jpg,.jpeg,.png"
                          required
                          hint="Passport-size photo with white background (JPG/PNG, max 2MB)"
                          onChange={handlePhoto}
                          value={docs.photo}
                          preview={docs.photoPreview}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic documents */}
                  <div className={grid2}>
                    <FileBox
                      label="SEE / SLC Marksheet"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hint="Official marksheet issued by NEB or exam board"
                      onChange={handleFile("slcMarksheet")}
                      value={docs.slcMarksheet}
                    />
                    <FileBox
                      label="+2 Marksheet or Transcript"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hint="Official marksheet or transcript from your +2 institution"
                      onChange={handleFile("plus2Marksheet")}
                      value={docs.plus2Marksheet}
                    />
                  </div>

                  {/* Conditional: Caste cert */}
                  {(sch.scholarshipType === "reservation" || academic.applicationType === "reservation") &&
                    academic.reservationCategory === "caste" && (
                    <FileBox
                      label="Caste / Janajati Certificate"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hint="Government-issued caste or ethnicity certificate"
                      onChange={handleFile("casteCert")}
                      value={docs.casteCert}
                    />
                  )}

                  {/* Conditional: Disability cert */}
                  {(sch.scholarshipType === "reservation" || academic.applicationType === "reservation") &&
                    academic.reservationCategory === "disability" && (
                    <FileBox
                      label="Disability Identity Card / Certificate"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                      hint="Issued by the National Disability Identification Card Programme"
                      onChange={handleFile("disabilityCert")}
                      value={docs.disabilityCert}
                    />
                  )}

                  <div className={grid2}>
                    <FileBox
                      label="School / College Certificate or TC"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hint="Transfer certificate or recommendation from your institution"
                      onChange={handleFile("schoolCert")}
                      value={docs.schoolCert}
                    />
                    <FileBox
                      label="Additional Document (Optional)"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hint="Any other supporting document (citizenship, birth certificate, etc.)"
                      onChange={handleFile("otherDoc")}
                      value={docs.otherDoc}
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 4: Review & Submit ────────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Review Your Application</h3>
                    <p className="text-sm text-gray-500 mb-5">Please review all information before submitting. You cannot edit after submission.</p>
                  </div>

                  {/* Review sections */}
                  {[
                    {
                      title: "Personal Information",
                      rows: [
                        ["Full Name", personal.fullName],
                        ["Date of Birth", personal.dob],
                        ["Gender", personal.gender],
                        ["Phone", personal.phone],
                        ["Email", personal.email || "—"],
                        ["Province", personal.province],
                        ["District", personal.district],
                        ["Municipality", personal.municipality || "—"],
                        ["Ward", personal.ward || "—"],
                        ["Guardian", `${personal.guardianName} (${personal.guardianRelation})`],
                      ],
                    },
                    {
                      title: "Academic Information",
                      rows: [
                        ["Application Type", academic.applicationType],
                        ["School / College", academic.schoolName || "—"],
                        ["School Type", academic.schoolType || "—"],
                        ["Education Level", academic.currentEducationLevel || "—"],
                        ["SEE GPA", academic.slcGpa || "—"],
                        ["SEE %", academic.slcPercentage || "—"],
                        ["+2 GPA", academic.plus2Gpa || "—"],
                        ["+2 %", academic.plus2Percentage || "—"],
                        ["+2 Stream", academic.plus2Stream || "—"],
                        ...(academic.applicationType === "reservation"
                          ? [["Reservation Category", academic.reservationCategory || "—"]]
                          : [["Achievements", academic.achievements || "—"]])
                      ],
                    },
                    {
                      title: "Uploaded Documents",
                      rows: [
                        ["Photo",           docs.photo?.name           || "❌ Not uploaded"],
                        ["SEE Marksheet",   docs.slcMarksheet?.name    || "— Not uploaded"],
                        ["+2 Marksheet",    docs.plus2Marksheet?.name  || "— Not uploaded"],
                        ["Caste Cert",      docs.casteCert?.name       || "— Not uploaded"],
                        ["Disability Cert", docs.disabilityCert?.name  || "— Not uploaded"],
                        ["School Cert",     docs.schoolCert?.name      || "— Not uploaded"],
                        ["Other Doc",       docs.otherDoc?.name        || "— Not uploaded"],
                      ],
                    },
                  ].map(({ title, rows }) => (
                    <div key={title} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <div className="bg-gray-100 px-4 py-2.5">
                        <h4 className="text-sm font-bold text-gray-700">{title}</h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {rows.filter(([, v]) => v && v !== "— Not uploaded").map(([k, v]) => (
                          <div key={k} className="flex px-4 py-2.5 text-sm gap-4">
                            <span className="text-gray-400 w-36 shrink-0 font-medium">{k}</span>
                            <span className={`text-gray-800 capitalize ${v?.includes("❌") ? "text-red-500 font-medium" : ""}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Declaration */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
                    <p className="font-semibold mb-2">Declaration</p>
                    <p>I hereby declare that all information provided in this application is true and accurate to the best of my knowledge. I understand that any false or misleading information may result in immediate disqualification and/or cancellation of the scholarship.</p>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ───────────────────────────────────────── */}
              <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button type="button" onClick={prevStep}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    ← Previous
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button type="button" onClick={nextStep}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                    Next →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={applyLoading}
                    className="px-8 py-2.5 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors flex items-center gap-2">
                    {applyLoading && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {applyLoading ? "Submitting…" : "✓ Submit Application"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}