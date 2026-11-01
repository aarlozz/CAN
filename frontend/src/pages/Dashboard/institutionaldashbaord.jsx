import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import InstitutionCourses from "../../Components/InstitutionCourses";
import {
  InstitutionNav,
  InstitutionStats,
} from "./institution/components/InstitutionHeader";
import InstitutionScholarshipsTab from "./institution/components/InstitutionScholarshipsTab";
import InstitutionApplicationsTab from "./institution/components/InstitutionApplicationsTab";
import ApplicationReviewModal from "./institution/components/ApplicationReviewModal";
import {
  EMPTY_FORM,
  EMPTY_APP_FILTERS,
  scholarshipToForm,
  recalcCoverage,
} from "./institution/utils/constants";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

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
  const [selectedApp, setSelectedApp] = useState(null);

  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [schLoading, setSchLoading] = useState(false);
  const [schError, setSchError] = useState("");
  const [appFilters, setAppFilters] = useState(EMPTY_APP_FILTERS);

  const token = localStorage.getItem("can_token") || localStorage.getItem("token");

  // ── Applications fetch (filter/paginate aware) ──────────────────────────────
  const fetchApplications = async (filters = appFilters, page = 1) => {
    if (!token) return;
    setAppLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
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

  // ── Initial data fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const profileReq = axios
      .get(`${API}/api/institution/dashboard-institution`, { headers })
      .then((res) => {
        if (res.data.profileCompleted === false) {
          navigate("/complete-institution-profile");
          return;
        }
        setData(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard.");
        }
      });

    const scholarshipReq = axios
      .get(`${API}/api/scholarship/my`, { headers })
      .then((res) => setScholarships(res.data.scholarships || []))
      .catch(() => setScholarships([]));

    const applicationReq = fetchApplications(EMPTY_APP_FILTERS, 1);

    Promise.all([profileReq, scholarshipReq, applicationReq]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  // ── Scholarship Form Handlers ───────────────────────────────────────────────
  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchError("");
    setShowScholarshipForm(true);
  };

  const openEditForm = (scholarship) => {
    setEditingId(scholarship._id);
    setForm(scholarshipToForm(scholarship));
    setSchError("");
    setShowScholarshipForm(true);
    setTimeout(() => {
      document
        .getElementById("scholarship-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const closeForm = () => {
    setShowScholarshipForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchError("");
  };

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

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

  const setAcademicField = (field) => (e) => {
    const val = e.target.value;
    const other = field === "minGPA" ? "minPercentage" : "minGPA";
    setForm((f) => ({ ...f, [field]: val, [other]: val ? "" : f[other] }));
  };

  const buildPayload = () => {
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
        "Please name the entrance exam if you're setting a minimum score."
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
        const res = await axios.put(
          `${API}/api/scholarship/${editingId}`,
          payload,
          { headers }
        );
        const updated = res.data.scholarship;
        setScholarships((prev) =>
          prev.map((s) => (s._id === editingId ? updated : s))
        );
      } else {
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
            : "Failed to create scholarship.")
      );
    } finally {
      setSchLoading(false);
    }
  };

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

  const handleReview = async (appId, status) => {
    try {
      await axios.patch(
        `${API}/api/application/${appId}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, applicationStatus: status } : a
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  // ── Render States ───────────────────────────────────────────────────────────
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
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </>
    );

  const pendingCount = applications.filter(
    (a) => a.applicationStatus === "pending"
  ).length;
  const approvedCount = applications.filter(
    (a) => a.applicationStatus === "approved"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ── Sub-Nav ── */}
      <InstitutionNav
        data={data}
        tab={tab}
        setTab={setTab}
        pendingCount={pendingCount}
      />

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
          {/* Quick Stats */}
          <InstitutionStats
            scholarshipsCount={scholarships.length}
            appTotal={appTotal}
            pendingCount={pendingCount}
            approvedCount={approvedCount}
          />

          {/* Active Tab */}
          {tab === "scholarships" && (
            <InstitutionScholarshipsTab
              scholarships={scholarships}
              showScholarshipForm={showScholarshipForm}
              form={form}
              setForm={setForm}
              set={set}
              setCoverageField={setCoverageField}
              setAcademicField={setAcademicField}
              editingId={editingId}
              schError={schError}
              schLoading={schLoading}
              openCreateForm={openCreateForm}
              openEditForm={openEditForm}
              handleDeleteScholarship={handleDeleteScholarship}
              handleScholarshipSubmit={handleScholarshipSubmit}
              closeForm={closeForm}
              inputCls={inputCls}
              labelCls={labelCls}
            />
          )}

          {tab === "courses" && (
            <InstitutionCourses inputCls={inputCls} labelCls={labelCls} />
          )}

          {tab === "applications" && (
            <InstitutionApplicationsTab
              applications={applications}
              appTotal={appTotal}
              appPage={appPage}
              appPages={appPages}
              appLoading={appLoading}
              appFilters={appFilters}
              setAppFilters={setAppFilters}
              clearAppFilters={clearAppFilters}
              fetchApplications={fetchApplications}
              scholarships={scholarships}
              setSelectedApp={setSelectedApp}
              handleReview={handleReview}
            />
          )}
        </main>

        {/* Section Nav (Desktop Sidebar) */}
        <aside className="hidden lg:flex flex-col gap-2 w-60 shrink-0 order-1 lg:order-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">
            Manage
          </p>
          {[
            {
              key: "scholarships",
              label: "Scholarships",
              icon: "🎓",
              desc: "Post & edit listings",
            },
            {
              key: "courses",
              label: "Courses",
              icon: "📚",
              desc: "Programs you offer",
            },
            {
              key: "applications",
              label: "Applications",
              icon: "📝",
              desc: "Review submissions",
            },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-2xl border transition-colors cursor-pointer ${
                tab === s.key
                  ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                  : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  tab === s.key ? "bg-white/10" : "bg-red-50"
                }`}
              >
                {s.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">{s.label}</span>
                  {s.key === "applications" && pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {pendingCount}
                    </span>
                  )}
                </span>
                <span
                  className={`block text-xs mt-0.5 truncate ${
                    tab === s.key ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {s.desc}
                </span>
              </span>
            </button>
          ))}
        </aside>
      </div>

      {/* Review Modal */}
      <ApplicationReviewModal
        selectedApp={selectedApp}
        setSelectedApp={setSelectedApp}
        handleReview={handleReview}
      />

      <Footer />
    </div>
  );
}