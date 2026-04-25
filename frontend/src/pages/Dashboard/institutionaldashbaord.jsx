import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-44 shrink-0">
        {label}
      </span>
      <span className="text-gray-800 text-sm">{value}</span>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h2 className="text-gray-900 font-bold text-base">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 mt-6 first:mt-0">
      {children}
    </p>
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

// ─── Empty form state (mirrors Scholarship schema exactly) ────────────────────
const EMPTY_FORM = {
  scholarshipTitle: "",
  description: "",
  termsAndConditions: "",
  applicationDeadline: "",
  // coverage
  scholarshipType2: "",
  amountNpr: "",
  percentage: "",
  // eligibility
  targetLevel: "",
  targetFaculty: "",
  subject: "",
  gender: "any",
  isNepali: true,
  hasDisability: false,
  additionalRequirements: "",
  requiredDocuments: "", // comma-separated → split on submit
  // seats
  totalSeats: "",
  remainingSeats: "",
  // location filter
  provinceName: "",
  districtName: "",
  municipalityName: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InstitutionalDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("profile");

  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [schLoading, setSchLoading] = useState(false);
  const [schError, setSchError] = useState("");

  const token = localStorage.getItem("token");

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/login-institution");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const profileReq = axios
      .get(`${API}/api/institution/dashboard-institution`, { headers })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login-institution");
        } else
          setError(err.response?.data?.message || "Failed to load dashboard.");
      });

    const scholarshipReq = axios
      .get(`${API}/api/scholarship/my`, { headers })
      .then((res) => setScholarships(res.data.scholarships || []))
      .catch(() => setScholarships([]));

    const applicationReq = axios
      .get(`${API}/api/application/institution`, { headers })
      .then((res) => setApplications(res.data.applications || []))
      .catch(() => setApplications([]));

    Promise.all([profileReq, scholarshipReq, applicationReq]).finally(() =>
      setLoading(false),
    );
  }, [navigate, token]);

  // ── Field change helper ──────────────────────────────────────────────────────
  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setSchError("");

    // Validate remaining <= total
    if (form.remainingSeats !== "" && form.totalSeats !== "") {
      if (Number(form.remainingSeats) > Number(form.totalSeats)) {
        setSchError("Remaining seats cannot exceed total seats.");
        return;
      }
    }

    setSchLoading(true);
    try {
      const payload = {
        scholarshipTitle: form.scholarshipTitle,
        description: form.description || undefined,
        termsAndConditions: form.termsAndConditions || undefined,
        applicationDeadline: form.applicationDeadline,

        coverage: {
          scholarshipType2: form.scholarshipType2 || undefined,
          amountNpr: form.amountNpr ? Number(form.amountNpr) : undefined,
          percentage: form.percentage ? Number(form.percentage) : undefined,
        },

        eligibilityCriteria: {
          targetLevel: form.targetLevel || undefined,
          targetFaculty: form.targetFaculty || undefined,
          subject: form.subject || undefined,
          gender: form.gender,
          isNepali: form.isNepali,
          hasDisability: form.hasDisability,
          additionalRequirements: form.additionalRequirements || undefined,
          requiredDocuments: form.requiredDocuments
            ? form.requiredDocuments
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
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

      const res = await axios.post(`${API}/api/scholarship/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setScholarships((prev) => [res.data.scholarship, ...prev]);
      setShowScholarshipForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSchError(
        err.response?.data?.message || "Failed to create scholarship.",
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

  // ── Loading / error states ───────────────────────────────────────────────────
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
            onClick={() => navigate("/login-institution")}
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
  const locationStr = [
    loc.street,
    loc.ward && `Ward ${loc.ward}`,
    loc.municipality,
    loc.district,
    loc.province,
  ]
    .filter(Boolean)
    .join(", ");

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {data?.institutionName}
            </h1>
            <p className="text-gray-500 text-sm">
              {data?.institutionType} · {loc.district}, {loc.province}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Scholarships", value: scholarships.length },
            { label: "Applications", value: applications.length },
            {
              label: "Pending",
              value: applications.filter(
                (a) => a.applicationStatus === "pending",
              ).length,
            },
            {
              label: "Approved",
              value: applications.filter(
                (a) => a.applicationStatus === "approved",
              ).length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
            >
              <p className="text-2xl font-extrabold text-red-500">{value}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {["profile", "scholarships", "applications"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-white text-red-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ─────────────────────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Institution Information">
              <InfoRow label="Name" value={data?.institutionName} />
              <InfoRow label="Type" value={data?.institutionType} />
              <InfoRow label="Established" value={data?.establishedYear} />
              <InfoRow label="Location" value={locationStr} />
              <InfoRow label="Website" value={data?.website} />
              {data?.description && (
                <div className="pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {data.description}
                  </p>
                </div>
              )}
            </Card>
            <div className="flex flex-col gap-6">
              <Card title="Account Details">
                <InfoRow label="Name" value={user.name} />
                <InfoRow label="Email" value={user.email} />
              </Card>
              <Card title="Contact Person">
                {contact.name ? (
                  <>
                    <InfoRow label="Name" value={contact.name} />
                    <InfoRow label="Designation" value={contact.designation} />
                    <InfoRow label="Phone" value={contact.phone} />
                    <InfoRow label="Email" value={contact.email} />
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No contact person added.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS TAB ─────────────────────────────────────────────────── */}
        {tab === "scholarships" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setShowScholarshipForm(!showScholarshipForm);
                  setSchError("");
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {showScholarshipForm ? "Cancel" : "+ Post Scholarship"}
              </button>
            </div>

            {/* ── CREATE FORM ─────────────────────────────────────────────────── */}
            {showScholarshipForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  New Scholarship
                </h3>
                <p className="text-gray-400 text-xs mb-6">
                  Fields marked <span className="text-red-400">*</span> are
                  required.
                </p>

                {schError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                    {schError}
                  </div>
                )}

                <form onSubmit={handleScholarshipSubmit}>
                  {/* ── SECTION 1: Core Details ─────────────────────────────── */}
                  <SectionHeading>Core Details</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>
                        Scholarship Title{" "}
                        <span className="text-red-400">*</span>
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
                        Application Deadline{" "}
                        <span className="text-red-400">*</span>
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

                  {/* ── SECTION 2: Coverage ─────────────────────────────────── */}
                  <SectionHeading>Coverage</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Scholarship Type</label>
                      <select
                        className={inputCls}
                        value={form.scholarshipType2}
                        onChange={set("scholarshipType2")}
                      >
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
                      <label className={labelCls}>Amount (NPR)</label>
                      <input
                        className={inputCls}
                        type="number"
                        min="0"
                        value={form.amountNpr}
                        onChange={set("amountNpr")}
                        placeholder="e.g. 50000"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Coverage Percentage (%)
                      </label>
                      <input
                        className={inputCls}
                        type="number"
                        min="0"
                        max="100"
                        value={form.percentage}
                        onChange={set("percentage")}
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>

                  {/* ── SECTION 3: Seats ─────────────────────────────────────── */}
                  <SectionHeading>Seats</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <label className={labelCls}>
                        Remaining / Available Seats
                      </label>
                      <input
                        className={inputCls}
                        type="number"
                        min="0"
                        value={form.remainingSeats}
                        onChange={set("remainingSeats")}
                        placeholder="Defaults to Total Seats if left empty"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Leave blank to default to total seats.
                      </p>
                    </div>
                  </div>

                  {/* ── SECTION 4: Eligibility ───────────────────────────────── */}
                  <SectionHeading>Eligibility Criteria</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Target Level</label>
                      <select
                        className={inputCls}
                        value={form.targetLevel}
                        onChange={set("targetLevel")}
                      >
                        <option value="">— Any level —</option>
                        <option value="plus_two">Plus Two</option>
                        <option value="bachelor">Bachelor</option>
                        <option value="master">Master</option>
                        <option value="mphil">M.Phil</option>
                        <option value="phd">PhD</option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Target Faculty</label>
                      <input
                        className={inputCls}
                        value={form.targetFaculty}
                        onChange={set("targetFaculty")}
                        placeholder="e.g. Science, Management"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Subject</label>
                      <input
                        className={inputCls}
                        value={form.subject}
                        onChange={set("subject")}
                        placeholder="e.g. Computer Engineering"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Gender</label>
                      <select
                        className={inputCls}
                        value={form.gender}
                        onChange={set("gender")}
                      >
                        <option value="any">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelCls}>
                        Additional Requirements
                      </label>
                      <textarea
                        className={inputCls + " resize-none"}
                        rows={2}
                        value={form.additionalRequirements}
                        onChange={set("additionalRequirements")}
                        placeholder="Any other eligibility details..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelCls}>Required Documents</label>
                      <input
                        className={inputCls}
                        value={form.requiredDocuments}
                        onChange={set("requiredDocuments")}
                        placeholder="Comma-separated: slc_marksheet, plus2_gradesheet, citizenship"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Separate multiple documents with a comma.
                      </p>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex items-center gap-3">
                      <input
                        id="isNepali"
                        type="checkbox"
                        className="w-4 h-4 accent-red-500"
                        checked={form.isNepali}
                        onChange={set("isNepali")}
                      />
                      <label
                        htmlFor="isNepali"
                        className="text-sm text-gray-700"
                      >
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
                      <label
                        htmlFor="hasDisability"
                        className="text-sm text-gray-700"
                      >
                        For students with disability
                      </label>
                    </div>
                  </div>

                  {/* ── SECTION 5: Location Filter ───────────────────────────── */}
                  <SectionHeading>
                    Location Filter{" "}
                    <span className="normal-case font-normal text-gray-400">
                      (leave blank = open to all)
                    </span>
                  </SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Province</label>
                      <input
                        className={inputCls}
                        value={form.provinceName}
                        onChange={set("provinceName")}
                        placeholder="e.g. Bagmati"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>District</label>
                      <input
                        className={inputCls}
                        value={form.districtName}
                        onChange={set("districtName")}
                        placeholder="e.g. Kathmandu"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Municipality</label>
                      <input
                        className={inputCls}
                        value={form.municipalityName}
                        onChange={set("municipalityName")}
                        placeholder="e.g. Kathmandu Metropolitan"
                      />
                    </div>
                  </div>

                  {/* ── Form actions ─────────────────────────────────────────── */}
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowScholarshipForm(false);
                        setForm(EMPTY_FORM);
                        setSchError("");
                      }}
                      className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={schLoading}
                      className="px-6 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors"
                    >
                      {schLoading ? "Posting…" : "Post Scholarship"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Scholarship list */}
            {scholarships.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📋</div>
                <p className="font-medium">No scholarships posted yet</p>
                <p className="text-sm mt-1">
                  Click "+ Post Scholarship" to create your first one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scholarships.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-base leading-tight flex-1 mr-2">
                        {s.scholarshipTitle}
                      </h4>
                      {s.coverage?.scholarshipType2 && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${TYPE_COLORS[s.coverage.scholarshipType2] || "bg-gray-100 text-gray-600"}`}
                        >
                          {s.coverage.scholarshipType2.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 space-y-1 mb-4">
                      <p>
                        📅 Deadline:{" "}
                        {new Date(s.applicationDeadline).toLocaleDateString()}
                      </p>
                      {s.coverage?.amountNpr > 0 && (
                        <p>💰 NPR {s.coverage.amountNpr.toLocaleString()}</p>
                      )}
                      {s.coverage?.percentage > 0 && (
                        <p>📊 {s.coverage.percentage}% coverage</p>
                      )}
                      {s.totalSeats > 0 && (
                        <p>
                          🪑 {s.remainingSeats ?? s.totalSeats} / {s.totalSeats}{" "}
                          seats available
                        </p>
                      )}
                      {s.eligibilityCriteria?.targetLevel && (
                        <p>
                          🎓{" "}
                          {s.eligibilityCriteria.targetLevel.replace("_", " ")}
                        </p>
                      )}
                      <p>
                        📝 {s.statistics?.totalApplications || 0} applications
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/scholarships/${s._id}`}
                        className="flex-1 text-center text-xs font-medium py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        View
                      </Link>
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
            )}
          </div>
        )}

        {/* ── APPLICATIONS TAB ─────────────────────────────────────────────────── */}
        {tab === "applications" && (
          <div>
            {applications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📨</div>
                <p className="font-medium">No applications yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Student
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Scholarship
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {app.studentSnapshot?.fullName || "—"}
                          <div className="text-xs text-gray-400">
                            {app.studentSnapshot?.location?.district}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {app.scholarshipId?.scholarshipTitle || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[app.applicationType] || "bg-gray-100 text-gray-600"}`}
                          >
                            {app.applicationType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[app.applicationStatus] || "bg-gray-100 text-gray-500"}`}
                          >
                            {app.applicationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.applicationStatus === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleReview(app._id, "approved")
                                }
                                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(app._id, "under_review")
                                }
                                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                              >
                                Review
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(app._id, "rejected")
                                }
                                className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {app.applicationStatus === "under_review" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleReview(app._id, "approved")
                                }
                                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(app._id, "rejected")
                                }
                                className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {["approved", "rejected", "withdrawn"].includes(
                            app.applicationStatus,
                          ) && (
                            <span className="text-xs text-gray-400">
                              No actions
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
