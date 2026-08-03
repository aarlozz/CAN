import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import NepaliDate from "nepali-date-converter";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Personal Info",
  "Academic Records",
  "Documents",
  "Review & Submit",
];

const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const EDUCATION_LEVELS = ["SEE", "+2", "Bachelors", "Masters", "Other"];
const SCHOOL_TYPES = ["Government", "Community", "Private", "Other"];
const BOARDS = [
  "NEB (National Examinations Board)",
  "CTEVT",
  "Tribhuvan University (TU)",
  "Pokhara University (PU)",
  "Kathmandu University (KU)",
  "Purbanchal University",
  "Mid-Western University",
  "Far-Western University",
  "Other",
];
const BS_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

const RESERVATION_CATEGORIES = [
  { value: "government_school", label: "Government School Student" },
  { value: "community_school",  label: "Community School Student" },
  { value: "caste",             label: "Caste-Based Reservation" },
  { value: "disability",        label: "Person with Disability" },
  { value: "gender",            label: "Gender-Based (Female/Other)" },
  { value: "other",             label: "Other" },
];

const TYPE_TO_TRACK = {
  merit_based:     "merit",
  disability:      "reservation",
  gender:          "reservation",
  ethnic:          "reservation",
  full_tuition:    null,
  partial_tuition: null,
  need_based:      null,
};

const TYPE_BADGE = {
  full_tuition:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial_tuition: "bg-sky-50 text-sky-700 border-sky-200",
  merit_based:     "bg-blue-50 text-blue-700 border-blue-200",
  need_based:      "bg-amber-50 text-amber-700 border-amber-200",
  disability:      "bg-purple-50 text-purple-700 border-purple-200",
  gender:          "bg-pink-50 text-pink-700 border-pink-200",
  ethnic:          "bg-orange-50 text-orange-700 border-orange-200",
};
const TYPE_LABEL = {
  full_tuition:    "Full Tuition",
  partial_tuition: "Partial Tuition",
  merit_based:     "Merit Based",
  need_based:      "Need Based",
  disability:      "Disability",
  gender:          "Gender",
  ethnic:          "Ethnic",
};
const LEVEL_LABEL = {
  plus_two: "+2 / PCL",
  bachelor: "Bachelor",
  master:   "Master",
  mphil:    "M.Phil",
  phd:      "PhD",
  diploma:  "Diploma",
};

const LEVEL_ORDER = { SEE: 1, "+2": 2, Bachelors: 3, Masters: 4, Other: 5 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const readFileAsBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

function getBsDaysInMonth(bsYear, bsMonth) {
  for (let d = 32; d >= 28; d--) {
    try { new NepaliDate(bsYear, bsMonth - 1, d); return d; } catch (_) {}
  }
  return 30;
}

const deadlineInfo = (d) => {
  const deadline = new Date(d);
  const diff = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { label: "Deadline passed", color: "text-red-500",    expired: true  };
  if (diff <= 7) return { label: `${diff} days left`, color: "text-orange-500", expired: false };
  return {
    label: deadline.toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" }),
    color: "text-gray-700",
    expired: false,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBar({ step }) {
  return (
    <div className="flex items-center justify-between mb-10 px-2">
      {STEP_LABELS.map((label, i) => {
        const idx  = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {i < STEP_LABELS.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-300 ${done ? "bg-red-500" : "bg-gray-200"}`} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300 ${
              done   ? "bg-red-500 text-white shadow-md shadow-red-100"
              : active ? "bg-white border-2 border-red-500 text-red-500 shadow-md"
              :          "bg-white border-2 border-gray-200 text-gray-400"
            }`}>
              {done ? "✓" : idx}
            </div>
            <span className={`mt-2 text-xs font-medium text-center leading-tight ${
              active ? "text-red-600" : done ? "text-gray-600" : "text-gray-400"
            }`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DatePickerAdBs({ value, onChange, label, required }) {
  const [mode, setMode] = useState("AD");
  const currentBs = (() => {
    try {
      if (value) {
        const [y, m, d] = value.split("-").map(Number);
        const nd = new NepaliDate(new Date(y, m - 1, d));
        return { year: nd.getYear(), month: nd.getMonth() + 1, day: nd.getDate() };
      }
    } catch (_) {}
    return { year: 2060, month: 1, day: 1 };
  })();

  const [bsYear,  setBsYear]  = useState(currentBs.year);
  const [bsMonth, setBsMonth] = useState(currentBs.month);
  const [bsDay,   setBsDay]   = useState(currentBs.day);
  const bsDays = getBsDaysInMonth(bsYear, bsMonth);

  const handleBsChange = (y, m, d) => {
    try {
      const nd  = new NepaliDate(y, m - 1, d);
      const ad  = nd.toJsDate();
      const str = `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, "0")}-${String(ad.getDate()).padStart(2, "0")}`;
      onChange(str);
    } catch (_) {}
  };

  const inpCls = "border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
          {["AD", "BS"].map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md transition-all ${mode === m ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      {mode === "AD" ? (
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inpCls + " w-full"} />
      ) : (
        <div className="flex gap-2">
          <select value={bsYear} onChange={(e) => { const y = Number(e.target.value); setBsYear(y); handleBsChange(y, bsMonth, bsDay); }} className={inpCls + " flex-1"}>
            {Array.from({ length: 91 }, (_, i) => 2000 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={bsMonth} onChange={(e) => { const mo = Number(e.target.value); setBsMonth(mo); const sd = Math.min(bsDay, getBsDaysInMonth(bsYear, mo)); setBsDay(sd); handleBsChange(bsYear, mo, sd); }} className={inpCls + " flex-1"}>
            {BS_MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
          </select>
          <select value={bsDay} onChange={(e) => { const day = Number(e.target.value); setBsDay(day); handleBsChange(bsYear, bsMonth, day); }} className={inpCls + " w-20"}>
            {Array.from({ length: bsDays }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}
      {value && (
        <p className="text-xs text-gray-400 mt-1">
          {mode === "AD" ? (() => { try { const [y,m,d] = value.split("-").map(Number); const nd = new NepaliDate(new Date(y,m-1,d)); return `≈ ${nd.getYear()} ${BS_MONTHS[nd.getMonth()]} ${nd.getDate()} BS`; } catch(_){return "";} })()
            : (() => { try { const [y,m,d] = value.split("-").map(Number); return `≈ ${y} / ${String(m).padStart(2,"0")} / ${String(d).padStart(2,"0")} AD`; } catch(_){return "";} })()}
        </p>
      )}
    </div>
  );
}

function DocCard({ label, required, hint, value, preview, mimeType, onReplace, onRemove }) {
  const inputRef = useRef();
  const isImage = value && (mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(value?.name || ""));
  const isPdf   = value && (mimeType === "application/pdf" || /\.pdf$/i.test(value?.name || ""));

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onReplace} />
      {value ? (
        <div className="border-2 border-green-300 bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
            {isImage && preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : isImage ? (
              <img src={URL.createObjectURL(value)} alt="preview" className="w-full h-full object-cover" />
            ) : isPdf ? (
              <div className="flex flex-col items-center justify-center w-full h-full bg-red-50">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
                </svg>
                <span className="text-xs text-red-500 font-bold mt-0.5">PDF</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-500">{value.name?.split(".").pop()?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 truncate">{value.name}</p>
            <p className="text-xs text-gray-400">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">
              ✏️ Replace
            </button>
            <button type="button" onClick={onRemove}
              className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
              🗑️ Delete
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50 rounded-xl cursor-pointer transition-all flex flex-col items-center py-5 text-gray-400 hover:text-red-400">
          <svg className="w-7 h-7 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="text-sm font-medium">Click to upload</p>
          <p className="text-xs mt-0.5">PDF, JPG, PNG</p>
        </div>
      )}
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

function EligibilityChecklist({ ec }) {
  if (!ec) return null;
  const items = [
    ec.targetLevel    && { icon: "🎓", label: "Level",       value: LEVEL_LABEL[ec.targetLevel] || ec.targetLevel },
    ec.targetFaculty  && { icon: "📚", label: "Faculty",     value: ec.targetFaculty },
    ec.subject        && { icon: "🔬", label: "Subject",     value: ec.subject },
    ec.gender && ec.gender !== "any" && { icon: "👤", label: "Gender", value: ec.gender.charAt(0).toUpperCase() + ec.gender.slice(1) + " only" },
    ec.isNepali       && { icon: "🇳🇵", label: "Citizenship", value: "Nepali citizens only" },
    ec.hasDisability  && { icon: "♿", label: "Disability",  value: "Must have disability" },
  ].filter(Boolean);

  if (!items.length && !ec.additionalRequirements) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <h2 className="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-black">✓</span>
        Eligibility Criteria
      </h2>
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
              <span className="text-base shrink-0">{item.icon}</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {ec.additionalRequirements && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">Additional Requirements</p>
          <p className="leading-relaxed">{ec.additionalRequirements}</p>
        </div>
      )}
    </div>
  );
}

function TermsCard({ terms }) {
  const [open, setOpen] = useState(false);
  if (!terms) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <span className="text-lg">📋</span> Terms & Conditions
        </h2>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open ? (
        <div className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-4">{terms}</div>
      ) : (
        <p className="mt-2 text-xs text-gray-400">Click to read the full terms and conditions.</p>
      )}
    </div>
  );
}

function TrackBadge({ applicationType, locked }) {
  if (!applicationType) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold mb-6 w-fit ${
      applicationType === "merit"
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "bg-purple-50 text-purple-700 border border-purple-200"
    }`}>
      {applicationType === "merit" ? "🏆" : "🤝"}
      {applicationType === "merit" ? "Merit Track" : "Reservation Track"}
      {locked && <span className="ml-2 text-xs font-normal opacity-70">(set by scholarship type)</span>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScholarshipDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const formRef   = useRef(null);
  const token     = localStorage.getItem("token");
  const role      = localStorage.getItem("role");

  const [scholarship,  setScholarship]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [applying,     setApplying]     = useState(false);
  const [step,         setStep]         = useState(1);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError,   setApplyError]   = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // ── Personal Info ──────────────────────────────────────────────────────────
  const [personal, setPersonal] = useState({
    fullName: "", dob: "", gender: "", phone: "", email: "",
    province: "", district: "", municipality: "", ward: "", street: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
  });

  // ── Academic ───────────────────────────────────────────────────────────────
  const [applicationType, setApplicationType] = useState("");
  const [trackLocked,     setTrackLocked]     = useState(false);
  const [academic, setAcademic] = useState({
    schoolName: "", schoolType: "", currentEducationLevel: "",
    slcBoard: "", slcGpa: "", slcPercentage: "", slcYear: "",
    plus2Board: "", plus2Gpa: "", plus2Percentage: "", plus2Year: "", plus2Stream: "",
    entranceScore: "", entranceName: "",
    achievements: "", extraCurricular: "",
    reservationCategory: "", caste: "", disabilityType: "",
    disabilityPercentage: "", genderCategory: "", supportingDetails: "",
  });

  // ── Documents ─────────────────────────────────────────────────────────────
  const [docs, setDocs] = useState({
    photo: null,           photoPreview: null,
    slcMarksheet: null,    slcMarksheetPreview: null,
    plus2Marksheet: null,  plus2MarksheetPreview: null,
    casteCert: null,       casteCertPreview: null,
    disabilityCert: null,  disabilityCertPreview: null,
    schoolCert: null,      schoolCertPreview: null,
    otherDoc: null,        otherDocPreview: null,
  });

  // ── Fetch scholarship ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/scholarship/${id}`)
      .then((res) => {
        const sch = res.data.scholarship;
        setScholarship(sch);
        const schType = sch.coverage?.scholarshipType2;
        const forced  = TYPE_TO_TRACK[schType];
        if (forced) { setApplicationType(forced); setTrackLocked(true); }
        else setTrackLocked(false);
      })
      .catch((err) => setError(err.response?.data?.message || "Scholarship not found."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Auto-fill from student profile ────────────────────────────────────────
  useEffect(() => {
    if (!token || role !== "student") return;
    axios.get(`${API}/api/student/dashboard-student`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const s = res.data;
        const rawDob = s.personal_info?.dob;
        const formattedDob = rawDob ? new Date(rawDob).toISOString().split("T")[0] : "";
        setPersonal((p) => ({
          ...p,
          fullName:         s.user?.name || "",
          email:            s.user?.email || "",
          gender:           s.personal_info?.gender || "",
          phone:            s.personal_info?.phone || "",
          dob:              formattedDob,
          province:         s.address?.province || "",
          district:         s.address?.district || "",
          municipality:     s.address?.municipality || "",
          ward:             s.address?.ward || "",
          street:           s.address?.street || "",
          guardianName:     s.guardian_info?.name || "",
          guardianRelation: s.guardian_info?.relation || "",
          guardianPhone:    s.guardian_info?.phone_number || "",
        }));
        setAcademic((f) => ({
          ...f,
          schoolName:            s.educationInfo?.schoolName || "",
          schoolType:            s.educationInfo?.schoolType || "",
          currentEducationLevel: s.educationInfo?.currentEducationLevel || "",
          caste:                 s.reservationInfo?.caste || "",
          disabilityType:        s.reservationInfo?.disabilityType || "",
        }));
      })
      .catch(() => {});
  }, [token, role]);

  // ── Auto-scroll to form ────────────────────────────────────────────────────
  useEffect(() => {
    if (applying && formRef.current) {
      setTimeout(() => formRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [applying]);

  // ── File helpers ───────────────────────────────────────────────────────────
  const handlePhoto = async (e) => {
    if (!e) { setDocs((d) => ({ ...d, photo: null, photoPreview: null })); return; }
    const file = e.target?.files?.[0];
    if (!file) return;
    const b64 = await readFileAsBase64(file);
    setDocs((d) => ({ ...d, photo: file, photoPreview: b64 }));
  };

  const handleFileWithPreview = (field) => async (e) => {
    if (!e) { setDocs((d) => ({ ...d, [field]: null, [`${field}Preview`]: null })); return; }
    const file = e.target?.files?.[0];
    if (!file) return;
    let preview = null;
    if (file.type.startsWith("image/")) preview = await readFileAsBase64(file);
    setDocs((d) => ({ ...d, [field]: file, [`${field}Preview`]: preview }));
  };

  const removeDoc = (field) => setDocs((d) => ({ ...d, [field]: null, [`${field}Preview`]: null }));

  const docProps = (field, label, hint) => ({
    label,
    hint,
    required: false,
    value:    docs[field],
    preview:  docs[`${field}Preview`],
    mimeType: docs[field]?.type,
    onReplace: handleFileWithPreview(field),
    onRemove:  () => removeDoc(field),
  });

  // ── Education level helpers ────────────────────────────────────────────────
  const eduLevel   = academic.currentEducationLevel;
  const levelOrder = LEVEL_ORDER[eduLevel] || 0;
  const showSEE    = levelOrder >= 1;
  const showPlus2  = levelOrder >= 2;

  // ── Step validation ────────────────────────────────────────────────────────
  const nextStep = () => {
    setApplyError("");
    if (step === 1) {
      if (!personal.fullName || !personal.phone || !personal.province || !personal.district) {
        setApplyError("Full name, phone, province and district are required.");
        return;
      }
    }
    if (step === 2) {
      if (!applicationType) { setApplyError("Please select an application track (Merit or Reservation)."); return; }
      if (!academic.schoolName || !academic.currentEducationLevel) { setApplyError("School name and current education level are required."); return; }
      if (applicationType === "reservation" && !academic.reservationCategory) { setApplyError("Please select a reservation category."); return; }
    }
    if (step === 3 && !docs.photo) { setApplyError("Applicant photo is required."); return; }
    setStep((s) => s + 1);
  };

  const prevStep = () => { setApplyError(""); setStep((s) => s - 1); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!token || role !== "student") { navigate("/login"); return; }
    if (!docs.photo) { setApplyError("Applicant photo is required before submitting."); return; }
    setApplyError("");
    setApplyLoading(true);
    try {
      const documents = [];
      const pushDoc = (file, type, title) => {
        if (!file) return;
        documents.push({ documentType: type, documentTitle: title, filePath: file.name, fileName: file.name, fileSize: file.size, mimeType: file.type });
      };
      if (docs.photo) {
        documents.push({ documentType: "other", documentTitle: "Applicant Photo", filePath: docs.photoPreview, fileName: docs.photo.name, fileSize: docs.photo.size, mimeType: docs.photo.type });
      }
      pushDoc(docs.slcMarksheet,   "slc_marksheet",          "SEE / SLC Marksheet");
      pushDoc(docs.plus2Marksheet, "plus2_marksheet",        "+2 Marksheet");
      pushDoc(docs.casteCert,      "caste_certificate",      "Caste Certificate");
      pushDoc(docs.disabilityCert, "disability_certificate", "Disability Certificate");
      pushDoc(docs.schoolCert,     "school_certificate",     "School Certificate / TC");
      pushDoc(docs.otherDoc,       "other",                  "Additional Document");

      const payload = {
        scholarshipId: id,
        applicationType,
        documents,
        ...(applicationType === "merit"
          ? {
              meritDetails: {
                academicRecords: {
                  slcGpa:          Number(academic.slcGpa)          || undefined,
                  slcPercentage:   Number(academic.slcPercentage)   || undefined,
                  slcBoard:        academic.slcBoard                || undefined,
                  slcYear:         Number(academic.slcYear)         || undefined,
                  plus2Gpa:        Number(academic.plus2Gpa)        || undefined,
                  plus2Percentage: Number(academic.plus2Percentage) || undefined,
                  plus2Board:      academic.plus2Board              || undefined,
                  plus2Year:       Number(academic.plus2Year)       || undefined,
                  plus2Stream:     academic.plus2Stream             || undefined,
                  entranceScore:   Number(academic.entranceScore)   || undefined,
                  entranceName:    academic.entranceName            || undefined,
                },
                achievements:    academic.achievements    || undefined,
                extraCurricular: academic.extraCurricular || undefined,
              },
            }
          : {
              reservationDetails: {
                reservationCategory: academic.reservationCategory,
                schoolType:          academic.schoolType            || undefined,
                caste:               academic.caste                 || undefined,
                disabilityType:      academic.disabilityType        || undefined,
                disabilityPercentage: Number(academic.disabilityPercentage) || undefined,
                genderCategory:      academic.genderCategory        || undefined,
                supportingDetails:   academic.supportingDetails     || undefined,
              },
            }),
      };

      await axios.post(`${API}/api/application/apply`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setApplySuccess(true);
      setApplying(false);
    } catch (err) {
      setApplyError(err.response?.data?.message || "Application failed. Please try again.");
      setStep(4);
    } finally {
      setApplyLoading(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inp   = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const lbl   = "block text-sm font-semibold text-gray-700 mb-1.5";
  const grid2 = "grid grid-cols-1 sm:grid-cols-2 gap-5";

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading)
    return (
      <>

        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" />
        </div>

      </>
    );

  if (error)
    return (
      <>

        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <Link to="/scholarships" className="text-red-500 hover:underline text-sm">← Back to scholarships</Link>
        </div>

      </>
    );

  const sch     = scholarship;
  const inst    = sch.institutionId || {};
  const dl      = deadlineInfo(sch.applicationDeadline);
  const isExpired = dl.expired;
  const noSeats   = sch?.remainingSeats === 0;
  const schType   = sch.coverage?.scholarshipType2;

  return (
    <>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/scholarships" className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 mb-6">
          ← Back to scholarships
        </Link>

        {/* ── Scholarship Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              {schType && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border mb-3 inline-block ${TYPE_BADGE[schType] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {TYPE_LABEL[schType] || schType}
                </span>
              )}
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{sch.scholarshipTitle}</h1>
              <p className="text-gray-500 mt-1 font-medium">🏫 {sch.institutionName}</p>
            </div>
            <div className="shrink-0">
              {isExpired ? (
                <span className="bg-gray-100 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg block">Deadline Passed</span>
              ) : noSeats ? (
                <span className="bg-red-50 text-red-500 text-sm font-medium px-4 py-2 rounded-lg block">No Seats Left</span>
              ) : applySuccess ? (
                <span className="bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg block">✓ Applied!</span>
              ) : !token ? (
                <Link to="/login" className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm block text-center">
                  Login to Apply
                </Link>
              ) : role === "student" ? (
                <button
                  onClick={() => { setApplying((v) => !v); setStep(1); setApplyError(""); }}
                  className={`font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm ${applying ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-red-500 hover:bg-red-600 text-white"}`}
                >
                  {applying ? "Cancel Application" : "Apply Now"}
                </button>
              ) : (
                <span className="bg-gray-50 text-gray-400 text-sm px-4 py-2 rounded-lg block">Institutions cannot apply</span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
            {[
              { label: "Deadline",     value: dl.label, color: dl.color },
              { label: "Amount",       value: sch.coverage?.amountNpr > 0 ? `NPR ${sch.coverage.amountNpr.toLocaleString()}` : sch.coverage?.percentage > 0 ? `${sch.coverage.percentage}%` : "—" },
              { label: "Seats Left",   value: sch.remainingSeats != null ? sch.remainingSeats : "—" },
              { label: "Applications", value: sch.statistics?.totalApplications ?? 0 },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`font-bold text-lg ${color || "text-gray-900"}`}>{value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {sch.totalSeats > 0 && sch.remainingSeats != null && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-medium">Seat availability</span>
                <span>{sch.remainingSeats} of {sch.totalSeats} remaining</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
                  style={{ width: `${Math.round(((sch.totalSeats - sch.remainingSeats) / sch.totalSeats) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {sch.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <h2 className="font-bold text-gray-900 mb-3 text-base">About this Scholarship</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{sch.description}</p>
          </div>
        )}

        <EligibilityChecklist ec={sch.eligibilityCriteria} />

        {sch.eligibilityCriteria?.requiredDocuments?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <h2 className="font-bold text-gray-900 mb-3 text-base">Required Documents</h2>
            <ul className="space-y-2">
              {sch.eligibilityCriteria.requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

        <TermsCard terms={sch.termsAndConditions} />

        {inst._id && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <h2 className="font-bold text-gray-900 mb-3 text-base">Institution</h2>
            <p className="font-semibold text-gray-800">{inst.institutionName}</p>
            {inst.location?.province   && <p className="text-sm text-gray-500 mt-1">📍 {inst.location.district}, {inst.location.province}</p>}
            {inst.contactPerson?.email && <p className="text-sm text-gray-500 mt-0.5">✉️ {inst.contactPerson.email}</p>}
            {inst.contactPerson?.phone && <p className="text-sm text-gray-500 mt-0.5">📞 {inst.contactPerson.phone}</p>}
            {inst.website && (
              <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-sm text-red-500 hover:underline mt-1 inline-block">
                🌐 {inst.website}
              </a>
            )}
          </div>
        )}

        {/* Success banner */}
        {applySuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-xl font-extrabold text-green-800 mb-2">Application Submitted!</h2>
            <p className="text-green-600 text-sm mb-6">
              Your application for <strong>{sch.scholarshipTitle}</strong> has been submitted.
            </p>
            <Link to="/dashboard-student" className="bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors inline-block">
              View My Applications
            </Link>
          </div>
        )}

        {/* ── Multi-step Application Form ────────────────────────────────── */}
        {applying && role === "student" && !applySuccess && (
          <div ref={formRef} className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden scroll-mt-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 sm:px-8 py-5">
              <h2 className="text-white font-extrabold text-lg">Scholarship Application Form</h2>
              <p className="text-red-100 text-sm mt-0.5">{sch.scholarshipTitle} · {sch.institutionName}</p>
            </div>

            <div className="px-6 sm:px-8 py-8">
              <StepBar step={step} />

              {applyError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{applyError}</span>
                </div>
              )}

              {/* ── STEP 1: Personal Info ──────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Personal Information</h3>
                    <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-5 flex items-center gap-2">
                      <span>✓</span> Pre-filled from your profile — review and update if needed.
                    </p>
                  </div>
                  <div className={grid2}>
                    <div>
                      <label className={lbl}>Full Name (as per citizenship) <span className="text-red-500">*</span></label>
                      <input className={inp} placeholder="e.g. Ram Bahadur Thapa" value={personal.fullName}
                        onChange={(e) => setPersonal((p) => ({ ...p, fullName: e.target.value }))} />
                    </div>
                    <DatePickerAdBs label="Date of Birth" required value={personal.dob} onChange={(val) => setPersonal((p) => ({ ...p, dob: val }))} />
                    <div>
                      <label className={lbl}>Gender <span className="text-red-500">*</span></label>
                      <select className={inp} value={personal.gender} onChange={(e) => setPersonal((p) => ({ ...p, gender: e.target.value }))}>
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Phone Number <span className="text-red-500">*</span></label>
                      <input className={inp} placeholder="98XXXXXXXX" maxLength={10} value={personal.phone}
                        onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={lbl}>Email Address</label>
                      <input className={inp} type="email" placeholder="your@email.com" value={personal.email}
                        onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <SectionHeading>Permanent Address</SectionHeading>
                    <div className={grid2}>
                      <div>
                        <label className={lbl}>Province <span className="text-red-500">*</span></label>
                        <select className={inp} value={personal.province} onChange={(e) => setPersonal((p) => ({ ...p, province: e.target.value }))}>
                          <option value="">Select province</option>
                          {NEPAL_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>District <span className="text-red-500">*</span></label>
                        <input className={inp} placeholder="e.g. Kathmandu" value={personal.district}
                          onChange={(e) => setPersonal((p) => ({ ...p, district: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Municipality / VDC</label>
                        <input className={inp} placeholder="e.g. Kathmandu Metropolitan" value={personal.municipality}
                          onChange={(e) => setPersonal((p) => ({ ...p, municipality: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Ward No.</label>
                        <input className={inp} placeholder="e.g. 10" value={personal.ward}
                          onChange={(e) => setPersonal((p) => ({ ...p, ward: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <SectionHeading>Guardian / Parent Information</SectionHeading>
                    <div className={grid2}>
                      <div>
                        <label className={lbl}>Guardian Full Name</label>
                        <input className={inp} placeholder="e.g. Hari Bahadur Thapa" value={personal.guardianName}
                          onChange={(e) => setPersonal((p) => ({ ...p, guardianName: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Relation</label>
                        <select className={inp} value={personal.guardianRelation} onChange={(e) => setPersonal((p) => ({ ...p, guardianRelation: e.target.value }))}>
                          <option value="">Select relation</option>
                          <option>Father</option><option>Mother</option><option>Uncle</option>
                          <option>Aunt</option><option>Grandfather</option><option>Guardian</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Guardian Phone</label>
                        <input className={inp} placeholder="98XXXXXXXX" maxLength={10} value={personal.guardianPhone}
                          onChange={(e) => setPersonal((p) => ({ ...p, guardianPhone: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Academic Records ───────────────────────────── */}
              {step === 2 && (
                <div className="space-y-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Academic Information</h3>
                    <p className="text-sm text-gray-500 mb-5">Provide your academic background and results.</p>
                  </div>

                  {trackLocked ? (
                    <TrackBadge applicationType={applicationType} locked={true} />
                  ) : (
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-700 mb-3">Application Track <span className="text-red-500">*</span></p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: "merit",       icon: "🏆", title: "Merit Track",       desc: "Based on academic results & achievements" },
                          { val: "reservation", icon: "🤝", title: "Reservation Track", desc: "Based on category, caste, disability or gender" },
                        ].map(({ val, icon, title, desc }) => (
                          <button key={val} type="button" onClick={() => setApplicationType(val)}
                            className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                              applicationType === val ? "border-red-400 bg-red-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                            }`}>
                            <span className="text-2xl mb-1">{icon}</span>
                            <p className={`text-sm font-bold ${applicationType === val ? "text-red-700" : "text-gray-700"}`}>{title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={grid2}>
                    <div>
                      <label className={lbl}>School / College Name <span className="text-red-500">*</span></label>
                      <input className={inp} placeholder="e.g. Kantipur Secondary School" value={academic.schoolName}
                        onChange={(e) => setAcademic((f) => ({ ...f, schoolName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>School Type</label>
                      <select className={inp} value={academic.schoolType} onChange={(e) => setAcademic((f) => ({ ...f, schoolType: e.target.value }))}>
                        <option value="">Select type</option>
                        {SCHOOL_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Current Education Level <span className="text-red-500">*</span></label>
                      <select className={inp} value={academic.currentEducationLevel} onChange={(e) => setAcademic((f) => ({ ...f, currentEducationLevel: e.target.value }))}>
                        <option value="">Select level</option>
                        {EDUCATION_LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  {showSEE && (
                    <>
                      <SectionHeading>SEE / SLC Results</SectionHeading>
                      <div className={grid2}>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Board</label>
                          <select className={inp} value={academic.slcBoard} onChange={(e) => setAcademic((f) => ({ ...f, slcBoard: e.target.value }))}>
                            <option value="">Select board</option>
                            {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>GPA (out of 4.0)</label>
                          <input className={inp} type="number" step="0.01" min="0" max="4" placeholder="e.g. 3.75" value={academic.slcGpa}
                            onChange={(e) => setAcademic((f) => ({ ...f, slcGpa: e.target.value }))} />
                        </div>
                        <div>
                          <label className={lbl}>Percentage (%)</label>
                          <input className={inp} type="number" step="0.01" min="0" max="100" placeholder="e.g. 82.50" value={academic.slcPercentage}
                            onChange={(e) => setAcademic((f) => ({ ...f, slcPercentage: e.target.value }))} />
                        </div>
                        <p className="sm:col-span-2 text-xs text-gray-400 -mt-3">Enter GPA or Percentage — whichever applies.</p>
                        <div>
                          <label className={lbl}>Year of Completion (BS)</label>
                          <input className={inp} type="number" min="2050" max="2090" placeholder="e.g. 2079" value={academic.slcYear}
                            onChange={(e) => setAcademic((f) => ({ ...f, slcYear: e.target.value }))} />
                        </div>
                      </div>
                    </>
                  )}

                  {showPlus2 && (
                    <>
                      <SectionHeading>+2 / Intermediate Results</SectionHeading>
                      <div className={grid2}>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Board</label>
                          <select className={inp} value={academic.plus2Board} onChange={(e) => setAcademic((f) => ({ ...f, plus2Board: e.target.value }))}>
                            <option value="">Select board</option>
                            {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>GPA (out of 4.0)</label>
                          <input className={inp} type="number" step="0.01" min="0" max="4" placeholder="e.g. 3.60" value={academic.plus2Gpa}
                            onChange={(e) => setAcademic((f) => ({ ...f, plus2Gpa: e.target.value }))} />
                        </div>
                        <div>
                          <label className={lbl}>Percentage (%)</label>
                          <input className={inp} type="number" step="0.01" min="0" max="100" placeholder="e.g. 78.00" value={academic.plus2Percentage}
                            onChange={(e) => setAcademic((f) => ({ ...f, plus2Percentage: e.target.value }))} />
                        </div>
                        <p className="sm:col-span-2 text-xs text-gray-400 -mt-3">Enter GPA or Percentage — whichever applies.</p>
                        <div>
                          <label className={lbl}>Stream / Faculty</label>
                          <select className={inp} value={academic.plus2Stream} onChange={(e) => setAcademic((f) => ({ ...f, plus2Stream: e.target.value }))}>
                            <option value="">Select stream</option>
                            <option>Science</option><option>Management</option><option>Humanities</option>
                            <option>Education</option><option>Law</option><option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Year of Completion (BS)</label>
                          <input className={inp} type="number" min="2050" max="2090" placeholder="e.g. 2081" value={academic.plus2Year}
                            onChange={(e) => setAcademic((f) => ({ ...f, plus2Year: e.target.value }))} />
                        </div>
                      </div>
                    </>
                  )}

                  {applicationType === "merit" && (
                    <>
                      <SectionHeading>Merit Details</SectionHeading>
                      <div className={grid2}>
                        <div>
                          <label className={lbl}>Entrance Exam Score</label>
                          <input className={inp} type="number" step="0.01" placeholder="e.g. 85.00" value={academic.entranceScore}
                            onChange={(e) => setAcademic((f) => ({ ...f, entranceScore: e.target.value }))} />
                        </div>
                        <div>
                          <label className={lbl}>Exam Name</label>
                          <input className={inp} placeholder="e.g. IOE Entrance" value={academic.entranceName}
                            onChange={(e) => setAcademic((f) => ({ ...f, entranceName: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Academic Achievements</label>
                          <textarea className={inp + " resize-none"} rows={3} placeholder="Scholarships, awards, academic distinctions…" value={academic.achievements}
                            onChange={(e) => setAcademic((f) => ({ ...f, achievements: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Extracurricular Activities</label>
                          <textarea className={inp + " resize-none"} rows={3} placeholder="Sports, cultural activities, community service…" value={academic.extraCurricular}
                            onChange={(e) => setAcademic((f) => ({ ...f, extraCurricular: e.target.value }))} />
                        </div>
                      </div>
                    </>
                  )}

                  {applicationType === "reservation" && (
                    <>
                      <SectionHeading>Reservation Details</SectionHeading>
                      <div className={grid2}>
                        <div className="sm:col-span-2">
                          <label className={lbl}>Reservation Category <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {RESERVATION_CATEGORIES.map((rc) => (
                              <label key={rc.value} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                                academic.reservationCategory === rc.value ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}>
                                <input type="radio" name="resCategory" value={rc.value} checked={academic.reservationCategory === rc.value}
                                  onChange={(e) => setAcademic((f) => ({ ...f, reservationCategory: e.target.value }))} className="accent-red-500" />
                                {rc.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        {academic.reservationCategory === "caste" && (
                          <div>
                            <label className={lbl}>Caste / Ethnicity</label>
                            <input className={inp} placeholder="e.g. Tamang, Magar, Tharu" value={academic.caste}
                              onChange={(e) => setAcademic((f) => ({ ...f, caste: e.target.value }))} />
                          </div>
                        )}
                        {academic.reservationCategory === "disability" && (
                          <>
                            <div>
                              <label className={lbl}>Type of Disability</label>
                              <select className={inp} value={academic.disabilityType} onChange={(e) => setAcademic((f) => ({ ...f, disabilityType: e.target.value }))}>
                                <option value="">Select type</option>
                                <option>Physical</option><option>Visual</option><option>Hearing</option>
                                <option>Intellectual</option><option>Psychosocial</option><option>Other</option>
                              </select>
                            </div>
                            <div>
                              <label className={lbl}>Disability Percentage (%)</label>
                              <input className={inp} type="number" min="0" max="100" placeholder="e.g. 50" value={academic.disabilityPercentage}
                                onChange={(e) => setAcademic((f) => ({ ...f, disabilityPercentage: e.target.value }))} />
                            </div>
                          </>
                        )}
                        {academic.reservationCategory === "gender" && (
                          <div>
                            <label className={lbl}>Gender Category</label>
                            <select className={inp} value={academic.genderCategory} onChange={(e) => setAcademic((f) => ({ ...f, genderCategory: e.target.value }))}>
                              <option value="">Select</option>
                              <option>Female</option><option>Third Gender</option><option>Other</option>
                            </select>
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <label className={lbl}>Supporting Details / Statement</label>
                          <textarea className={inp + " resize-none"} rows={3} placeholder="Explain your eligibility for this reservation category…" value={academic.supportingDetails}
                            onChange={(e) => setAcademic((f) => ({ ...f, supportingDetails: e.target.value }))} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── STEP 3: Documents ─────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Document Uploads</h3>
                    <p className="text-sm text-gray-500 mb-1">Only your photo is required. All other documents are optional but recommended.</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex gap-2">
                      <span>⚠️</span>
                      <span>Make sure all documents are valid. False documents will result in disqualification.</span>
                    </div>
                  </div>

                  {/* Photo */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Applicant Photograph <span className="text-red-500">*</span></h4>
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className="shrink-0">
                        {docs.photoPreview ? (
                          <img src={docs.photoPreview} alt="Preview" className="w-28 h-36 object-cover rounded-xl border-2 border-green-300 shadow-sm" />
                        ) : (
                          <div className="w-28 h-36 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs text-center">No photo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <DocCard label="Passport-size Photo" required hint="White background, passport-size (JPG/PNG)"
                          value={docs.photo} preview={docs.photoPreview} mimeType={docs.photo?.type}
                          onReplace={handlePhoto} onRemove={() => setDocs((d) => ({ ...d, photo: null, photoPreview: null }))} />
                      </div>
                    </div>
                  </div>

                  <div className={grid2}>
                    <DocCard {...docProps("slcMarksheet",   "SEE / SLC Marksheet",          "Official marksheet from NEB or exam board")} />
                    <DocCard {...docProps("plus2Marksheet", "+2 Marksheet or Transcript",   "Official marksheet from your +2 institution")} />
                  </div>

                  {applicationType === "reservation" && academic.reservationCategory === "caste" && (
                    <DocCard {...docProps("casteCert", "Caste / Janajati Certificate", "Government-issued caste or ethnicity certificate")} />
                  )}
                  {applicationType === "reservation" && academic.reservationCategory === "disability" && (
                    <DocCard {...docProps("disabilityCert", "Disability Identity Card / Certificate", "Issued by the National Disability Identification Card Programme")} />
                  )}

                  <div className={grid2}>
                    <DocCard {...docProps("schoolCert", "School / College Certificate or TC", "Transfer certificate or recommendation")} />
                    <DocCard {...docProps("otherDoc",   "Additional Document (Optional)",     "Any other supporting document")} />
                  </div>
                </div>
              )}

              {/* ── STEP 4: Review ────────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Review Your Application</h3>
                    <p className="text-sm text-gray-500 mb-5">Review all details before submitting. You cannot edit after submission.</p>
                  </div>

                  {/* Track */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    applicationType === "merit" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                  }`}>
                    {applicationType === "merit" ? "🏆 Merit Track" : "🤝 Reservation Track"}
                    {trackLocked && <span className="text-xs font-normal opacity-60">(auto-set)</span>}
                  </div>

                  {/* Personal */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-100 px-4 py-2.5">
                      <h4 className="text-sm font-bold text-gray-700">Personal Information</h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {[
                        ["Full Name",    personal.fullName],
                        ["Date of Birth", personal.dob],
                        ["Gender",       personal.gender],
                        ["Phone",        personal.phone],
                        ["Email",        personal.email || "—"],
                        ["Province",     personal.province],
                        ["District",     personal.district],
                        ["Municipality", personal.municipality || "—"],
                        ["Ward",         personal.ward || "—"],
                        ["Guardian",     personal.guardianName ? `${personal.guardianName} (${personal.guardianRelation})` : "—"],
                      ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                        <div key={k} className="flex px-4 py-2.5 text-sm gap-4">
                          <span className="text-gray-400 w-36 shrink-0 font-medium">{k}</span>
                          <span className="text-gray-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Academic */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-100 px-4 py-2.5">
                      <h4 className="text-sm font-bold text-gray-700">Academic Information</h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {[
                        ["School / College",  academic.schoolName || "—"],
                        ["School Type",       academic.schoolType || "—"],
                        ["Education Level",   academic.currentEducationLevel || "—"],
                        showSEE   && ["SEE Board",      academic.slcBoard        || "—"],
                        showSEE   && ["SEE GPA",        academic.slcGpa          || "—"],
                        showSEE   && ["SEE %",          academic.slcPercentage   || "—"],
                        showSEE   && ["SEE Year",       academic.slcYear         || "—"],
                        showPlus2 && ["+2 Board",       academic.plus2Board      || "—"],
                        showPlus2 && ["+2 GPA",         academic.plus2Gpa        || "—"],
                        showPlus2 && ["+2 %",           academic.plus2Percentage || "—"],
                        showPlus2 && ["+2 Stream",      academic.plus2Stream     || "—"],
                        showPlus2 && ["+2 Year",        academic.plus2Year       || "—"],
                        applicationType === "merit"       && ["Entrance Score", academic.entranceScore  || "—"],
                        applicationType === "merit"       && ["Achievements",   academic.achievements   || "—"],
                        applicationType === "reservation" && ["Reservation",    academic.reservationCategory || "—"],
                      ].filter(Boolean).filter(([, v]) => v && v !== "—").map(([k, v]) => (
                        <div key={k} className="flex px-4 py-2.5 text-sm gap-4">
                          <span className="text-gray-400 w-36 shrink-0 font-medium">{k}</span>
                          <span className="text-gray-800 capitalize">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Documents — fully editable in review ── */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-100 px-4 py-2.5 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-700">Uploaded Documents</h4>
                      <span className="text-xs text-gray-400 italic">You can still replace or remove files</span>
                    </div>

                    <div className="p-4 space-y-5">

                      {/* Photo with large preview */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                          Applicant Photo <span className="text-red-400">*</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <div className="shrink-0">
                            {docs.photoPreview ? (
                              <img src={docs.photoPreview} alt="Photo preview"
                                className="w-20 h-28 object-cover rounded-xl border-2 border-green-300 shadow-sm" />
                            ) : (
                              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-[10px] text-center leading-tight">No photo</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 w-full">
                            <DocCard
                              label="" required
                              hint="White background, passport-size (JPG/PNG)"
                              value={docs.photo} preview={docs.photoPreview} mimeType={docs.photo?.type}
                              onReplace={handlePhoto}
                              onRemove={() => setDocs((d) => ({ ...d, photo: null, photoPreview: null }))}
                            />
                          </div>
                        </div>
                        {!docs.photo && (
                          <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                            <span>⚠️</span> Photo is required — please upload before submitting.
                          </p>
                        )}
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Other docs in 2-col grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DocCard {...docProps("slcMarksheet",   "SEE / SLC Marksheet",          "Official marksheet from NEB or exam board")} />
                        <DocCard {...docProps("plus2Marksheet", "+2 Marksheet or Transcript",   "Official marksheet from your +2 institution")} />

                        {applicationType === "reservation" && academic.reservationCategory === "caste" && (
                          <DocCard {...docProps("casteCert", "Caste / Janajati Certificate", "Government-issued caste or ethnicity certificate")} />
                        )}
                        {applicationType === "reservation" && academic.reservationCategory === "disability" && (
                          <DocCard {...docProps("disabilityCert", "Disability Identity Card / Cert", "Issued by the National Disability Identification Card Programme")} />
                        )}

                        <DocCard {...docProps("schoolCert", "School / College Certificate or TC", "Transfer certificate or recommendation")} />
                        <DocCard {...docProps("otherDoc",   "Additional Document (Optional)",     "Any other supporting document")} />
                      </div>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
                    <p className="font-semibold mb-2">Declaration</p>
                    <p>
                      I declare that all information provided is true and accurate. Any false or misleading
                      information may result in immediate disqualification and/or cancellation of the scholarship.
                    </p>
                  </div>
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button type="button" onClick={prevStep}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    ← Previous
                  </button>
                ) : <div />}
                {step < 4 ? (
                  <button type="button" onClick={nextStep}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                    Next →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={applyLoading || !docs.photo}
                    className="px-8 py-2.5 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                    {applyLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {applyLoading ? "Submitting…" : "✓ Submit Application"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}