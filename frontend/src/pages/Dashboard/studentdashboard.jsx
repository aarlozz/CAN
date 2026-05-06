import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  approved: {
    label: "Approved",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600 border-red-100" },
  under_review: {
    label: "Under Review",
    cls: "bg-blue-50 text-blue-600 border-blue-100",
  },
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-600 border-amber-100",
  },
  withdrawn: {
    label: "Withdrawn",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

// ─── Small helpers ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-gray-800 text-sm">{value}</span>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "student") {
      navigate("/");
      return;
    }

    axios
      .get(`${API}/api/student/dashboard-student`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else
          setError(
            err.response?.data?.message || "Failed to load your profile.",
          );
      })
      .finally(() => setLoading(false));

    axios
      .get(`${API}/api/student/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setAppLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" />
        </div>
      </>
    );

  // ── Error ────────────────────────────────────────────────────────────────────
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

  const user = data?.user || {};
  const personal = data?.personal_info || {};
  const address = data?.address || {};
  const guardian = data?.guardian_info || {};

  const initials = (user.name || "S")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const dobFormatted = personal.dob
    ? new Date(personal.dob).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const addressStr = [
    address.street,
    address.ward && `Ward ${address.ward}`,
    address.municipality,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

  // Filter applications
  const filtered =
    filter === "all"
      ? applications
      : applications.filter(
          (a) => (a.status || a.applicationStatus) === filter,
        );

  const counts = {
    all: applications.length,
    pending: applications.filter(
      (a) => (a.status || a.applicationStatus) === "pending",
    ).length,
    approved: applications.filter(
      (a) => (a.status || a.applicationStatus) === "approved",
    ).length,
    under_review: applications.filter(
      (a) => (a.status || a.applicationStatus) === "under_review",
    ).length,
    rejected: applications.filter(
      (a) => (a.status || a.applicationStatus) === "rejected",
    ).length,
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* ── TOP NAV BAR ───────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Left: name + avatar */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Right: profile + logout */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  profileOpen
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{ transform: profileOpen ? "rotate(90deg)" : "none" }}
                >
                  ›
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
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
        </div>

        {/* ── PAGE BODY ─────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
          {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Applied",
                  value: counts.all,
                  color: "text-gray-900",
                },
                {
                  label: "Pending",
                  value: counts.pending,
                  color: "text-amber-500",
                },
                {
                  label: "Approved",
                  value: counts.approved,
                  color: "text-emerald-600",
                },
                {
                  label: "Under Review",
                  value: counts.under_review,
                  color: "text-blue-600",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
                >
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* ── SCHOLARSHIPS SECTION ────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header + filter tabs */}
              <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    My Scholarships
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {counts.all} application{counts.all !== 1 ? "s" : ""} total
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { key: "all", label: "All", count: counts.all },
                    { key: "pending", label: "Pending", count: counts.pending },
                    {
                      key: "under_review",
                      label: "In Review",
                      count: counts.under_review,
                    },
                    {
                      key: "approved",
                      label: "Approved",
                      count: counts.approved,
                    },
                    {
                      key: "rejected",
                      label: "Rejected",
                      count: counts.rejected,
                    },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        filter === key
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {label}
                      {count > 0 && (
                        <span
                          className={`ml-1 ${filter === key ? "opacity-60" : "text-gray-400"}`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Application list */}
              {appLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin w-7 h-7 border-4 border-red-100 border-t-red-400 rounded-full" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-4">
                    {filter === "all" ? "📭" : "🔍"}
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">
                    {filter === "all"
                      ? "No applications yet"
                      : `No ${filter.replace("_", " ")} applications`}
                  </p>
                  <p className="text-sm text-gray-400 mb-5">
                    {filter === "all"
                      ? "Browse open scholarships and apply today."
                      : "Try a different filter to see your other applications."}
                  </p>
                  {filter === "all" && (
                    <a
                      href="/institutions"
                      className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Browse Scholarships
                      <span>→</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((app) => {
                    const appStatus =
                      app.status || app.applicationStatus || "pending";
                    return (
                      <div
                        key={app._id}
                        className="flex items-start sm:items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Left: scholarship info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-base shrink-0 mt-0.5">
                            🎓
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {app.scholarshipName ||
                                app.scholarshipId?.scholarshipTitle ||
                                "Scholarship"}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {app.institutionName ||
                                app.scholarshipId?.institutionName ||
                                "Institution"}
                            </p>
                            {app.applicationType && (
                              <span className="inline-block mt-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {app.applicationType}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: status + date */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <StatusBadge status={appStatus} />
                          {app.createdAt && (
                            <span className="text-[10px] text-gray-400">
                              {new Date(app.createdAt).toLocaleDateString(
                                "en-NP",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Browse more footer */}
              {!appLoading && counts.all > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                  <a
                    href="/institutions"
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                  >
                    + Browse more scholarships
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── PROFILE SIDEBAR ───────────────────────────────────────────── */}
          {profileOpen && (
            <aside className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm self-start sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)]">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                  My Profile
                </span>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Avatar + name */}
              <div className="flex flex-col items-center pt-6 pb-4 px-4 border-b border-gray-50">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-2xl font-bold text-red-500 mb-3">
                  {initials}
                </div>
                <p className="text-sm font-bold text-gray-900 text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                <span className="mt-2 text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Student
                </span>
              </div>

              {/* Profile data */}
              <div className="px-4 py-4 space-y-4">
                <ProfileSection title="Personal Info">
                  <InfoRow label="Full Name" value={user.name} />
                  <InfoRow label="Date of Birth" value={dobFormatted} />
                  <InfoRow label="Gender" value={personal.gender} />
                  <InfoRow label="Phone" value={personal.phone} />
                </ProfileSection>

                <ProfileSection title="Address">
                  <InfoRow label="Province" value={address.province} />
                  <InfoRow label="District" value={address.district} />
                  <InfoRow label="Municipality" value={address.municipality} />
                  <InfoRow label="Ward" value={address.ward} />
                  <InfoRow label="Street" value={address.street} />
                  {!addressStr && (
                    <p className="text-xs text-gray-400">
                      No address provided.
                    </p>
                  )}
                </ProfileSection>

                <ProfileSection title="Guardian">
                  {guardian.name ? (
                    <>
                      <InfoRow label="Name" value={guardian.name} />
                      <InfoRow label="Relation" value={guardian.relation} />
                      <InfoRow label="Phone" value={guardian.phone_number} />
                      <InfoRow label="Occupation" value={guardian.occupation} />
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">
                      No guardian info provided.
                    </p>
                  )}
                </ProfileSection>
              </div>

              {/* Logout from sidebar */}
              <div className="px-4 pb-5">
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
      </main>

      <Footer />
    </>
  );
}
