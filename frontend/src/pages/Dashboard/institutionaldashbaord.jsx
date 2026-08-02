import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import ScholarshipFormWizard, {
  ENTRANCE_EXAMS,
} from "../../Components/scholarshipformwizard";
import InstitutionCourses from "../../Components/InstitutionCourses";
import LocationCascade from "../../Components/LocationCascade";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 mb-3">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-gray-800 text-xs">{value}</span>
    </div>
  );
}

function ExpandSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-medium transition-colors"
      >
        <span>{title}</span>
        <span
          className="text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          ›
        </span>
      </button>
      {open && (
        <div className="px-3 pt-3 pb-1 bg-gray-50 rounded-b-lg mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

const TYPE_COLORS = {
  merit: "bg-blue-50 text-blue-700",
  reservation: "bg-purple-50 text-purple-700",
  both: "bg-green-50 text-green-700",
  full_tuition: "bg-teal-50 text-teal-700",
  partial_tuition: "bg-cyan-50 text-cyan-700",
  merit_based: "bg-blue-50 text-blue-700",
  need_based: "bg-orange-50 text-orange-700",
  disability: "bg-purple-50 text-purple-700",
  gender: "bg-pink-50 text-pink-700",
  ethnic: "bg-yellow-50 text-yellow-700",
};

const STATUS_COLORS = {
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  under_review: "bg-blue-50 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
  pending: "bg-yellow-50 text-yellow-700",
};

const EMPTY_FORM = {
  scholarshipTitle: "",
  description: "",
  termsAndConditions: "",
  applicationDeadline: "",
  scholarshipType2: "",
  totalProgramFeeNpr: "",
  amountNpr: "",
  percentage: "",
  targetLevel: "",
  targetFaculty: "",
  degreeProgram: "",
  university: "",
  collegeType: "",
  subject: "",
  gender: "any",
  isNepali: true,
  hasDisability: false,
  ethnicCategory: "",
  minGPA: "",
  minPercentage: "",
  entranceExamName: "",
  entranceExamOther: "", // free-text value when entranceExamName === "Other"
  minEntranceScore: "",
  additionalRequirements: "",
  requiredDocuments: [], // array of document-type values, driven by checkboxes
  totalSeats: "",
  remainingSeats: "",
  provinceName: "",
  districtName: "",
  municipalityName: "",
  __originalStatus: "", // not sent to backend — used only to show the
  // "this will go back to pending" warning when editing an approved one
};

// ── Applications filter defaults ───────────────────────────────────────────
const EMPTY_APP_FILTERS = {
  scholarshipId: "",
  status: "",
  applicationType: "",
  gender: "",
  province: "",
  district: "",
  municipality: "",
  scholarshipType: "",
  minAmount: "",
  maxAmount: "",
  search: "",
};

// Convert a scholarship object → flat form shape for editing
function scholarshipToForm(s) {
  // The saved entranceExamName might be a free-text value from before the
  // dropdown existed, or it might match one of the known ENTRANCE_EXAMS
  // options exactly. If it doesn't match, treat it as a custom "Other" value
  // so the wizard's dropdown + free-text field render correctly.
  const savedExamName = s.eligibilityCriteria?.entranceExamName || "";
  const examIsKnown = savedExamName === "" || ENTRANCE_EXAMS.includes(savedExamName);

  return {
    scholarshipTitle: s.scholarshipTitle || "",
    description: s.description || "",
    termsAndConditions: s.termsAndConditions || "",
    applicationDeadline: s.applicationDeadline
      ? new Date(s.applicationDeadline).toISOString().split("T")[0]
      : "",
    scholarshipType2: s.coverage?.scholarshipType2 || "",
    totalProgramFeeNpr:
      s.coverage?.totalProgramFeeNpr != null
        ? String(s.coverage.totalProgramFeeNpr)
        : "",
    amountNpr:
      s.coverage?.amountNpr != null ? String(s.coverage.amountNpr) : "",
    percentage:
      s.coverage?.percentage != null ? String(s.coverage.percentage) : "",
    targetLevel: s.eligibilityCriteria?.targetLevel || "",
    targetFaculty: s.eligibilityCriteria?.targetFaculty || "",
    degreeProgram: s.eligibilityCriteria?.degreeProgram || "",
    university: s.eligibilityCriteria?.university || "",
    collegeType: s.eligibilityCriteria?.collegeType || "",
    subject: s.eligibilityCriteria?.subject || "",
    gender: s.eligibilityCriteria?.gender || "any",
    isNepali: s.eligibilityCriteria?.isNepali ?? true,
    hasDisability: s.eligibilityCriteria?.hasDisability ?? false,
    ethnicCategory: s.eligibilityCriteria?.ethnicCategory || "",
    minGPA: s.eligibilityCriteria?.minGPA != null ? String(s.eligibilityCriteria.minGPA) : "",
    minPercentage:
      s.eligibilityCriteria?.minPercentage != null
        ? String(s.eligibilityCriteria.minPercentage)
        : "",
    entranceExamName: examIsKnown ? savedExamName : "Other",
    entranceExamOther: examIsKnown ? "" : savedExamName,
    minEntranceScore:
      s.eligibilityCriteria?.minEntranceScore != null
        ? String(s.eligibilityCriteria.minEntranceScore)
        : "",
    additionalRequirements: s.eligibilityCriteria?.additionalRequirements || "",
    requiredDocuments: Array.isArray(s.eligibilityCriteria?.requiredDocuments)
      ? s.eligibilityCriteria.requiredDocuments
      : [],
    totalSeats: s.totalSeats != null ? String(s.totalSeats) : "",
    remainingSeats: s.remainingSeats != null ? String(s.remainingSeats) : "",
    provinceName: s.locationFilter?.province?.provinceName || "",
    districtName: s.locationFilter?.district?.districtName || "",
    municipalityName: s.locationFilter?.municipality?.municipalityName || "",
    __originalStatus: s.verification?.status || "",
  };
}

// Mirrors the backend's buildCoverage auto-calc so the form shows the same
// derived number the institution will get back after saving:
//   fee + percentage    → amount
//   fee + amount        → percentage
//   percentage + amount → fee (only if no fee on record yet)
//   all three, or only one → left alone
function recalcCoverage({ totalProgramFeeNpr, amountNpr, percentage }) {
  const fee = totalProgramFeeNpr !== "" ? Number(totalProgramFeeNpr) : null;
  const amount = amountNpr !== "" ? Number(amountNpr) : null;
  const pct = percentage !== "" ? Number(percentage) : null;

  const hasFee = fee != null && !Number.isNaN(fee) && fee > 0;
  const hasAmount = amount != null && !Number.isNaN(amount);
  const hasPct = pct != null && !Number.isNaN(pct);

  let nextFee = totalProgramFeeNpr;
  let nextAmount = amountNpr;
  let nextPct = percentage;

  if (hasFee && hasPct && !hasAmount) {
    nextAmount = String(Math.round(fee * (pct / 100)));
  } else if (hasFee && hasAmount && !hasPct) {
    nextPct = String(Math.min(100, Math.round((amount / fee) * 10000) / 100));
  } else if (hasPct && hasAmount && !hasFee && pct > 0) {
    nextFee = String(Math.round(amount / (pct / 100)));
  }

  return {
    totalProgramFeeNpr: nextFee,
    amountNpr: nextAmount,
    percentage: nextPct,
  };
}

// ─── Seats progress bar ───────────────────────────────────────────────────────

function SeatsBar({ remaining, total }) {
  if (!total) return <span className="text-xs text-gray-400">—</span>;
  const pct = Math.round(((remaining ?? total) / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {remaining ?? total}/{total}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InstitutionalDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appTotal, setAppTotal] = useState(0);
  const [appPage, setAppPage] = useState(1);
  const [appPages, setAppPages] = useState(1);
  const [appLoading, setAppLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("scholarships");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode, string = edit mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [schLoading, setSchLoading] = useState(false);
  const [schError, setSchError] = useState("");

  const [appFilters, setAppFilters] = useState(EMPTY_APP_FILTERS);

  const token = localStorage.getItem("token");

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ── Applications fetch (filter/paginate aware) ──────────────────────────────
  const fetchApplications = async (filters = appFilters, page = 1) => {
    if (!token) return;
    setAppLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
      params.page = page;
      params.limit = 20;

      const res = await axios.get(`${API}/api/application/institution`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setApplications(res.data.applications || []);
      setAppTotal(res.data.total || 0);
      setAppPage(res.data.page || 1);
      setAppPages(res.data.pages || 1);
    } catch {
      setApplications([]);
    } finally {
      setAppLoading(false);
    }
  };

  // Re-fetch applications whenever filters change (debounced), reset to page 1
  useEffect(() => {
    const t = setTimeout(() => fetchApplications(appFilters, 1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appFilters]);

  const clearAppFilters = () => setAppFilters(EMPTY_APP_FILTERS);

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const profileReq = axios
      .get(`${API}/api/institution/dashboard-institution`, { headers })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else
          setError(err.response?.data?.message || "Failed to load dashboard.");
      });

    const scholarshipReq = axios
      .get(`${API}/api/scholarship/my`, { headers })
      .then((res) => setScholarships(res.data.scholarships || []))
      .catch(() => setScholarships([]));

    const applicationReq = fetchApplications(EMPTY_APP_FILTERS, 1);

    Promise.all([profileReq, scholarshipReq, applicationReq]).finally(() =>
      setLoading(false),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  // ── Open create form ─────────────────────────────────────────────────────────
  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchError("");
    setShowScholarshipForm(true);
  };

  // ── Open edit form ───────────────────────────────────────────────────────────
  const openEditForm = (scholarship) => {
    setEditingId(scholarship._id);
    setForm(scholarshipToForm(scholarship));
    setSchError("");
    setShowScholarshipForm(true);
    // Scroll form into view
    setTimeout(() => {
      document
        .getElementById("scholarship-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // ── Close form ───────────────────────────────────────────────────────────────
  const closeForm = () => {
    setShowScholarshipForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchError("");
  };

  // ── Field change ─────────────────────────────────────────────────────────────
  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  // Fee / Amount / Percentage share a triangle relationship — editing any one
  // of them re-derives whichever of the other two is missing (see
  // recalcCoverage). This mirrors what the backend will do on save, so the
  // institution sees the real numbers immediately instead of after submit.
  const setCoverageField = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: val };
      const recalced = recalcCoverage({
        totalProgramFeeNpr: next.totalProgramFeeNpr,
        amountNpr: next.amountNpr,
        percentage: next.percentage,
      });
      return { ...next, ...recalced };
    });
  };

  // GPA and Percentage measure the same "previous exam performance"
  // criterion on different scales — only one should be set at a time.
  const setAcademicField = (field) => (e) => {
    const val = e.target.value;
    const other = field === "minGPA" ? "minPercentage" : "minGPA";
    setForm((f) => ({ ...f, [field]: val, [other]: val ? "" : f[other] }));
  };

  // ── Build payload (shared by create & edit) ──────────────────────────────────
  const buildPayload = () => {
    // Resolve the "Other" entrance exam option down to the actual name the
    // institution typed, so the backend never sees the literal "Other".
    const resolvedExamName =
      form.entranceExamName === "Other"
        ? form.entranceExamOther
        : form.entranceExamName;

    return {
      scholarshipTitle: form.scholarshipTitle,
      description: form.description || undefined,
      termsAndConditions: form.termsAndConditions || undefined,
      applicationDeadline: form.applicationDeadline,
      coverage: {
        scholarshipType2: form.scholarshipType2 || undefined,
        totalProgramFeeNpr: form.totalProgramFeeNpr
          ? Number(form.totalProgramFeeNpr)
          : undefined,
        amountNpr: form.amountNpr ? Number(form.amountNpr) : undefined,
        percentage: form.percentage ? Number(form.percentage) : undefined,
      },
      eligibilityCriteria: {
        targetLevel: form.targetLevel || undefined,
        targetFaculty: form.targetFaculty || undefined,
        degreeProgram: form.degreeProgram || undefined,
        university: form.university || undefined,
        collegeType: form.collegeType || undefined,
        subject: form.subject || undefined,
        gender: form.gender,
        isNepali: form.isNepali,
        hasDisability: form.hasDisability,
        ethnicCategory: form.ethnicCategory || undefined,
        minGPA: form.minGPA ? Number(form.minGPA) : undefined,
        minPercentage: form.minPercentage ? Number(form.minPercentage) : undefined,
        entranceExamName: resolvedExamName || undefined,
        minEntranceScore: form.minEntranceScore
          ? Number(form.minEntranceScore)
          : undefined,
        additionalRequirements: form.additionalRequirements || undefined,
        // Already an array from the wizard's checkboxes — no split/parse needed.
        requiredDocuments: Array.isArray(form.requiredDocuments)
          ? form.requiredDocuments
          : [],
      },
      totalSeats: form.totalSeats ? Number(form.totalSeats) : undefined,
      remainingSeats: form.remainingSeats
        ? Number(form.remainingSeats)
        : undefined,
      locationFilter: {
        province: form.provinceName
          ? { provinceName: form.provinceName }
          : undefined,
        district: form.districtName
          ? { districtName: form.districtName }
          : undefined,
        municipality: form.municipalityName
          ? { municipalityName: form.municipalityName }
          : undefined,
      },
    };
  };

  // ── Submit (create or edit) ──────────────────────────────────────────────────
  // Final safety-net validation — the wizard already blocks these at the
  // per-step level, but this guards against any edge case (e.g. someone
  // submitting the form programmatically) and matches the backend's own
  // validateEligibilityExtras rules.
  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setSchError("");
    if (form.remainingSeats !== "" && form.totalSeats !== "") {
      if (Number(form.remainingSeats) > Number(form.totalSeats)) {
        setSchError("Remaining seats cannot exceed total seats.");
        return;
      }
    }
    if (form.minEntranceScore && !form.entranceExamName) {
      setSchError(
        "Please name the entrance exam if you're setting a minimum score.",
      );
      return;
    }
    if (
      form.minEntranceScore &&
      form.entranceExamName === "Other" &&
      !form.entranceExamOther
    ) {
      setSchError("Please name the entrance exam.");
      return;
    }
    setSchLoading(true);
    try {
      const payload = buildPayload();
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        // ── EDIT ──
        // Backend resets verification.status to "pending" on any edit unless
        // it's already pending, so a re-submitted approved scholarship goes
        // back under provincial-admin review automatically.
        const res = await axios.put(
          `${API}/api/scholarship/${editingId}`,
          payload,
          { headers },
        );
        const updated = res.data.scholarship;
        setScholarships((prev) =>
          prev.map((s) => (s._id === editingId ? updated : s)),
        );
      } else {
        // ── CREATE ──
        const res = await axios.post(`${API}/api/scholarship/create`, payload, {
          headers,
        });
        setScholarships((prev) => [res.data.scholarship, ...prev]);
      }

      closeForm();
    } catch (err) {
      setSchError(
        err.response?.data?.message ||
          (editingId
            ? "Failed to update scholarship."
            : "Failed to create scholarship."),
      );
    } finally {
      setSchLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteScholarship = async (id) => {
    if (!window.confirm("Delete this scholarship?")) return;
    try {
      await axios.delete(`${API}/api/scholarship/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScholarships((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  // ── Review ────────────────────────────────────────────────────────────────────
  const handleReview = async (appId, status) => {
    try {
      await axios.patch(
        `${API}/api/application/${appId}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, applicationStatus: status } : a,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (loading)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600"
          >
            Back to Login
          </button>
        </div>
      </>
    );

  const loc = data?.location || {};
  const contact = data?.contactPerson || {};
  const user = data?.user || {};
  const initials = (data?.institutionName || "IN")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Note: pending/approved counts are computed from the *currently loaded
  // page* of applications, since applications are now server-paginated.
  // Good enough for a quick glance; for exact totals across all pages the
  // backend would need to return status-bucketed counts separately.
  const pendingCount = applications.filter(
    (a) => a.applicationStatus === "pending",
  ).length;
  const approvedCount = applications.filter(
    (a) => a.applicationStatus === "approved",
  ).length;

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";
  const filterInputCls =
    "border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── TOP NAV ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left – institution identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {data?.institutionName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {data?.institutionType} · {loc.district}, {loc.province}
              </p>
            </div>
          </div>

          {/* Center – tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
            {["scholarships", "courses", "applications"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
                {t === "applications" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right – profile toggle + logout */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                sidebarOpen
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              Profile
              <span
                className="transition-transform duration-200 text-[10px]"
                style={{ transform: sidebarOpen ? "rotate(90deg)" : "none" }}
              >
                ›
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── BODY (content + sidebar) ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Scholarships",
                value: scholarships.length,
                accent: true,
              },
              { label: "Applications", value: appTotal },
              { label: "Pending (page)", value: pendingCount },
              { label: "Approved (page)", value: approvedCount },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
              >
                <p
                  className={`text-2xl font-bold ${accent ? "text-blue-600" : "text-gray-800"}`}
                >
                  {value}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ── SCHOLARSHIPS TAB ─────────────────────────────────────────────── */}
          {tab === "scholarships" && (
            <div className="space-y-6">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Scholarships
                </h2>
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <span className="text-lg leading-none">+</span>
                  Post Scholarship
                </button>
              </div>

              {/* ── CREATE / EDIT WIZARD ───────────────────────────────────── */}
              {showScholarshipForm && (
                <ScholarshipFormWizard
                  form={form}
                  setForm={setForm}
                  set={set}
                  setCoverageField={setCoverageField}
                  setAcademicField={setAcademicField}
                  editingId={editingId}
                  schError={schError}
                  schLoading={schLoading}
                  onSubmit={handleScholarshipSubmit}
                  onCancel={closeForm}
                  inputCls={inputCls}
                  labelCls={labelCls}
                />
              )}

              {/* ── CARD GRID ──────────────────────────────────────────────── */}
              {scholarships.length === 0 && !showScholarshipForm ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="font-medium">No scholarships posted yet</p>
                  <p className="text-sm mt-1">
                    Click "+ Post Scholarship" to create your first one.
                  </p>
                </div>
              ) : (
                <>
                  {scholarships.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scholarships.map((s) => (
                          <div
                            key={s._id}
                            className={`bg-white rounded-xl border shadow-sm p-5 hover:border-gray-200 transition-colors ${
                              editingId === s._id
                                ? "border-amber-300 ring-1 ring-amber-200"
                                : "border-gray-100"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                                {s.scholarshipTitle}
                              </h4>
                              {s.coverage?.scholarshipType2 && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[s.coverage.scholarshipType2] || "bg-gray-100 text-gray-600"}`}
                                >
                                  {s.coverage.scholarshipType2.replace(
                                    "_",
                                    " ",
                                  )}
                                </span>
                              )}
                              {s.verification?.status && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase ${STATUS_COLORS[s.verification.status] || "bg-gray-100 text-gray-600"}`}
                                >
                                  {s.verification.status.replace("_", " ")}
                                </span>
                              )}
                            </div>
                            {s.description && (
                              <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                                {s.description}
                              </p>
                            )}
                            <div className="space-y-1.5 mb-4">
                              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <span>📅</span>
                                {new Date(
                                  s.applicationDeadline,
                                ).toLocaleDateString("en-NP", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              {s.coverage?.amountNpr > 0 && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>💰</span> NPR{" "}
                                  {s.coverage.amountNpr.toLocaleString()}
                                </p>
                              )}
                              {s.coverage?.percentage > 0 && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>📊</span> {s.coverage.percentage}%
                                  coverage
                                </p>
                              )}
                              {s.coverage?.totalProgramFeeNpr > 0 && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>🎓</span> Fee: NPR{" "}
                                  {s.coverage.totalProgramFeeNpr.toLocaleString()}
                                </p>
                              )}
                              {s.totalSeats > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-500">
                                    🪑
                                  </span>
                                  <SeatsBar
                                    remaining={s.remainingSeats}
                                    total={s.totalSeats}
                                  />
                                </div>
                              )}
                              {s.eligibilityCriteria?.targetLevel && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>🎓</span>{" "}
                                  {s.eligibilityCriteria.targetLevel.replace(
                                    "_",
                                    " ",
                                  )}
                                </p>
                              )}
                              {(s.eligibilityCriteria?.minGPA != null ||
                                s.eligibilityCriteria?.minPercentage != null) && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>📈</span>{" "}
                                  {s.eligibilityCriteria.minGPA != null
                                    ? `Min GPA ${s.eligibilityCriteria.minGPA}`
                                    : `Min ${s.eligibilityCriteria.minPercentage}%`}
                                </p>
                              )}
                              {s.eligibilityCriteria?.ethnicCategory &&
                                s.eligibilityCriteria.ethnicCategory !==
                                  "any" && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1.5 capitalize">
                                    <span>🏷️</span>{" "}
                                    {s.eligibilityCriteria.ethnicCategory.replace(
                                      "_",
                                      " ",
                                    )}
                                  </p>
                                )}
                              {s.eligibilityCriteria?.entranceExamName && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <span>📝</span>{" "}
                                  {s.eligibilityCriteria.entranceExamName}
                                  {s.eligibilityCriteria.minEntranceScore !=
                                    null &&
                                    ` ≥ ${s.eligibilityCriteria.minEntranceScore}`}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <span>📝</span>{" "}
                                {s.statistics?.totalApplications || 0}{" "}
                                applications
                              </p>
                            </div>
                            {/* Card action buttons — now 3: View, Edit, Delete */}
                            <div className="flex gap-2 pt-3 border-t border-gray-50">
                              <Link
                                to={`/scholarships/${s._id}`}
                                className="flex-1 text-center text-xs font-medium py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-colors"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => openEditForm(s)}
                                className="flex-1 text-xs font-medium py-1.5 border border-amber-100 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteScholarship(s._id)}
                                className="flex-1 text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── TABLE ───────────────────────────────────────────── */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-50">
                          <h3 className="text-sm font-semibold text-gray-700">
                            All Scholarships
                          </h3>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Title
                              </th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Type
                              </th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Deadline
                              </th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Seats
                              </th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Status
                              </th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Applications
                              </th>
                              <th className="px-4 py-2.5" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {scholarships.map((s) => (
                              <tr
                                key={s._id}
                                className={`hover:bg-gray-50 transition-colors ${editingId === s._id ? "bg-amber-50" : ""}`}
                              >
                                <td className="px-5 py-3 font-medium text-gray-900 text-sm">
                                  {s.scholarshipTitle}
                                </td>
                                <td className="px-4 py-3">
                                  {s.coverage?.scholarshipType2 ? (
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[s.coverage.scholarshipType2] || "bg-gray-100 text-gray-600"}`}
                                    >
                                      {s.coverage.scholarshipType2.replace(
                                        "_",
                                        " ",
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                  {new Date(
                                    s.applicationDeadline,
                                  ).toLocaleDateString("en-NP", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </td>
                                <td className="px-4 py-3">
                                  <SeatsBar
                                    remaining={s.remainingSeats}
                                    total={s.totalSeats}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  {s.verification?.status ? (
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[s.verification.status] || "bg-gray-100 text-gray-600"}`}
                                    >
                                      {s.verification.status.replace("_", " ")}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                  {s.statistics?.totalApplications || 0}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2 justify-end">
                                    <Link
                                      to={`/scholarships/${s._id}`}
                                      className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                                    >
                                      View
                                    </Link>
                                    <button
                                      onClick={() => openEditForm(s)}
                                      className="text-xs text-amber-500 hover:text-amber-700 font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteScholarship(s._id)
                                      }
                                      className="text-xs text-red-400 hover:text-red-600 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── COURSES TAB ──────────────────────────────────────────────────── */}
          {tab === "courses" && (
            <InstitutionCourses inputCls={inputCls} labelCls={labelCls} />
          )}

          {/* ── APPLICATIONS TAB ─────────────────────────────────────────────── */}
          {tab === "applications" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Applications
                </h2>
                <span className="text-xs text-gray-400">
                  {appTotal} total
                </span>
              </div>

              {/* ── FILTER BAR ─────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  <input
                    placeholder="Search student name…"
                    value={appFilters.search}
                    onChange={(e) =>
                      setAppFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    className={`${filterInputCls} w-44`}
                  />

                  <select
                    value={appFilters.scholarshipId}
                    onChange={(e) =>
                      setAppFilters((f) => ({
                        ...f,
                        scholarshipId: e.target.value,
                      }))
                    }
                    className={filterInputCls}
                  >
                    <option value="">All Scholarships</option>
                    {scholarships.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.scholarshipTitle}
                      </option>
                    ))}
                  </select>

                  <select
                    value={appFilters.scholarshipType}
                    onChange={(e) =>
                      setAppFilters((f) => ({
                        ...f,
                        scholarshipType: e.target.value,
                      }))
                    }
                    className={filterInputCls}
                  >
                    <option value="">All Scholarship Types</option>
                    {[
                      "full_tuition",
                      "partial_tuition",
                      "merit_based",
                      "need_based",
                      "disability",
                      "gender",
                      "ethnic",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ")}
                      </option>
                    ))}
                  </select>

                  <select
                    value={appFilters.applicationType}
                    onChange={(e) =>
                      setAppFilters((f) => ({
                        ...f,
                        applicationType: e.target.value,
                      }))
                    }
                    className={filterInputCls}
                  >
                    <option value="">All Application Types</option>
                    <option value="merit">Merit</option>
                    <option value="reservation">Reservation</option>
                  </select>

                  <select
                    value={appFilters.status}
                    onChange={(e) =>
                      setAppFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    className={filterInputCls}
                  >
                    <option value="">All Statuses</option>
                    {[
                      "pending",
                      "under_review",
                      "approved",
                      "rejected",
                      "withdrawn",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>

                  <select
                    value={appFilters.gender}
                    onChange={(e) =>
                      setAppFilters((f) => ({ ...f, gender: e.target.value }))
                    }
                    className={filterInputCls}
                  >
                    <option value="">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Min NPR"
                    value={appFilters.minAmount}
                    onChange={(e) =>
                      setAppFilters((f) => ({
                        ...f,
                        minAmount: e.target.value,
                      }))
                    }
                    className={`${filterInputCls} w-24`}
                  />
                  <input
                    type="number"
                    placeholder="Max NPR"
                    value={appFilters.maxAmount}
                    onChange={(e) =>
                      setAppFilters((f) => ({
                        ...f,
                        maxAmount: e.target.value,
                      }))
                    }
                    className={`${filterInputCls} w-24`}
                  />

                  <button
                    onClick={clearAppFilters}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Location cascade — Province → District → Municipality,
                    filtering by name (matches studentSnapshot.location, which
                    stores plain name strings, not ObjectIds). Own row since
                    the component renders as a 3-column grid. */}
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <LocationCascade
                    idMode="name"
                    province={appFilters.province}
                    district={appFilters.district}
                    municipality={appFilters.municipality}
                    onChange={({ province, district, municipality }) =>
                      setAppFilters((f) => ({
                        ...f,
                        province,
                        district,
                        municipality,
                      }))
                    }
                    gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  />
                </div>
              </div>

              {appLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                  <div className="text-5xl mb-3">📨</div>
                  <p className="font-medium">No applications match these filters</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Student
                          </th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Scholarship
                          </th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Type
                          </th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Status
                          </th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {applications.map((app) => (
                          <tr
                            key={app._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-5 py-3">
                              <p className="font-medium text-gray-900 text-sm">
                                {app.studentSnapshot?.fullName || "—"}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {app.studentSnapshot?.location?.district}
                              </p>
                            </td>
                            {/* FIX: was app.scholarshipId?.scholarshipTitle —
                                the aggregation now returns `scholarship`
                                (singular, embedded object), not a populated
                                `scholarshipId`. */}
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px] truncate">
                              {app.scholarship?.scholarshipTitle || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[app.applicationType] || "bg-gray-100 text-gray-600"}`}
                              >
                                {app.applicationType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[app.applicationStatus] || "bg-gray-100 text-gray-500"}`}
                              >
                                {app.applicationStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {app.applicationStatus === "pending" && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleReview(app._id, "approved")
                                    }
                                    className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReview(app._id, "under_review")
                                    }
                                    className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium"
                                  >
                                    Review
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReview(app._id, "rejected")
                                    }
                                    className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {app.applicationStatus === "under_review" && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleReview(app._id, "approved")
                                    }
                                    className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReview(app._id, "rejected")
                                    }
                                    className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {["approved", "rejected", "withdrawn"].includes(
                                app.applicationStatus,
                              ) && (
                                <span className="text-[10px] text-gray-400">
                                  No actions
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── PAGINATION ──────────────────────────────────────────── */}
                  {appPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        disabled={appPage <= 1}
                        onClick={() => fetchApplications(appFilters, appPage - 1)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-400">
                        Page {appPage} of {appPages}
                      </span>
                      <button
                        disabled={appPage >= appPages}
                        onClick={() => fetchApplications(appFilters, appPage + 1)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>

        {/* ── PROFILE SIDEBAR ──────────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm self-start sticky top-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Profile
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center py-5 px-4 border-b border-gray-50">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-700 mb-3">
                {initials}
              </div>
              <p className="text-sm font-bold text-gray-900 text-center">
                {data?.institutionName}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {data?.institutionType}
              </p>
              {data?.establishedYear && (
                <p className="text-[10px] text-gray-400">
                  Est. {data.establishedYear}
                </p>
              )}
            </div>
            <div className="p-3 space-y-1.5">
              <ExpandSection title="Account">
                <InfoRow label="Name" value={user.name} />
                <InfoRow label="Email" value={user.email} />
              </ExpandSection>
              <ExpandSection title="Location">
                {loc.street && <InfoRow label="Street" value={loc.street} />}
                {loc.ward && (
                  <InfoRow label="Ward" value={`Ward ${loc.ward}`} />
                )}
                {loc.municipality && (
                  <InfoRow label="Municipality" value={loc.municipality} />
                )}
                {loc.district && (
                  <InfoRow label="District" value={loc.district} />
                )}
                {loc.province && (
                  <InfoRow label="Province" value={loc.province} />
                )}
                {data?.website && (
                  <InfoRow label="Website" value={data.website} />
                )}
              </ExpandSection>
              <ExpandSection title="Contact Person">
                {contact.name ? (
                  <>
                    <InfoRow label="Name" value={contact.name} />
                    <InfoRow label="Designation" value={contact.designation} />
                    <InfoRow label="Phone" value={contact.phone} />
                    <InfoRow label="Email" value={contact.email} />
                  </>
                ) : (
                  <p className="text-xs text-gray-400">
                    No contact person added.
                  </p>
                )}
              </ExpandSection>
              {data?.description && (
                <ExpandSection title="About">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {data.description}
                  </p>
                </ExpandSection>
              )}
            </div>
            <div className="px-3 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </aside>
        )}
      </div>

      <Footer />
    </div>
  );
}