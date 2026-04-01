import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

// FIXES IN THIS FILE:
// 1. "View & Apply" link was /scholarship/${s._id} (singular, no route exists)
//    Fixed to /scholarships/${s._id} (plural, matches App.jsx route)
// 2. Promise.all was used for all 3 fetches — if ANY one failed (e.g. scholarship
//    endpoint returned 500) the ENTIRE dashboard crashed showing "Something went wrong"
//    even though the student profile loaded fine.
//    Fixed: run fetches independently so failures are isolated.

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

function Card({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-gray-900 font-bold text-base mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

const STATUS_COLORS = {
  pending:      "bg-yellow-50 text-yellow-700",
  under_review: "bg-blue-50 text-blue-700",
  approved:     "bg-green-50 text-green-700",
  rejected:     "bg-red-50 text-red-700",
  withdrawn:    "bg-gray-100 text-gray-500",
};

const SCH_TYPE_COLORS = {
  merit:       "bg-blue-50 text-blue-700",
  reservation: "bg-purple-50 text-purple-700",
  both:        "bg-green-50 text-green-700",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData]                   = useState(null);
  const [scholarships, setScholarships]   = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [tab, setTab]                     = useState("profile");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!token) { navigate("/login"); return; }
    if (role !== "student") { navigate("/"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // FIX: Run each fetch independently instead of Promise.all.
    // With Promise.all, if /api/scholarship/all returns a 500 the entire
    // dashboard fails and shows "Something went wrong" even though the
    // student profile fetched successfully.
    // Now: profile failure = show error; scholarship/application failures
    // are silent (just show empty state) so the dashboard still loads.
    const profileReq = axios
      .get(`${API}/api/student/dashboard-student`, { headers })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load profile.");
        }
      });

    const scholarshipReq = axios
      .get(`${API}/api/scholarship/all`)
      .then((res) => setScholarships(res.data.scholarships || []))
      .catch(() => setScholarships([])); // silent — don't crash dashboard

    const applicationReq = axios
      .get(`${API}/api/application/my`, { headers })
      .then((res) => setMyApplications(res.data.applications || []))
      .catch(() => setMyApplications([])); // silent — don't crash dashboard

    Promise.all([profileReq, scholarshipReq, applicationReq]).finally(() =>
      setLoading(false)
    );
  }, [navigate, token]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await axios.patch(
        `${API}/api/application/${appId}/withdraw`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, applicationStatus: "withdrawn" } : a
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to withdraw.");
    }
  };

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
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

  const user      = data?.user || {};
  const personal  = data?.personal_info || {};
  const address   = data?.address || {};
  const guardian  = data?.guardian_info || {};
  const education = data?.educationInfo || {};

  const dobFormatted = personal.dob
    ? new Date(personal.dob).toLocaleDateString("en-NP", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  const appliedIds = new Set(
    myApplications.map((a) => a.scholarshipId?._id || a.scholarshipId)
  );

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-xl font-bold text-red-500">
              {user.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Province", value: address.province || "—" },
            { label: "District", value: address.district || "—" },
            { label: "Applied",  value: myApplications.length },
            {
              label: "Approved",
              value: myApplications.filter(
                (a) => a.applicationStatus === "approved"
              ).length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
            >
              <p className="text-lg font-extrabold text-red-500">{value}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
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
              {t === "scholarships" ? "Browse Scholarships" : t}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Personal Information" icon="👤">
              <InfoRow label="Full Name"     value={user.name} />
              <InfoRow label="Email"         value={user.email} />
              <InfoRow label="Date of Birth" value={dobFormatted} />
              <InfoRow label="Gender"        value={personal.gender} />
              <InfoRow label="Phone"         value={personal.phone} />
            </Card>
            <Card title="Address" icon="📍">
              <InfoRow label="Province"     value={address.province} />
              <InfoRow label="District"     value={address.district} />
              <InfoRow label="Municipality" value={address.municipality} />
              <InfoRow label="Ward"         value={address.ward} />
              <InfoRow label="Street"       value={address.street} />
              {!address.province && (
                <p className="text-gray-400 text-sm">No address added.</p>
              )}
            </Card>
            <Card title="Guardian Information" icon="👨‍👩‍👦">
              {guardian.name ? (
                <>
                  <InfoRow label="Name"       value={guardian.name} />
                  <InfoRow label="Relation"   value={guardian.relation} />
                  <InfoRow label="Phone"      value={guardian.phone_number} />
                  <InfoRow label="Occupation" value={guardian.occupation} />
                </>
              ) : (
                <p className="text-gray-400 text-sm">No guardian info added.</p>
              )}
            </Card>
            <Card title="Education" icon="🎓">
              {education.schoolName ? (
                <>
                  <InfoRow label="School"      value={education.schoolName} />
                  <InfoRow label="School Type" value={education.schoolType} />
                  <InfoRow label="Level"       value={education.currentEducationLevel} />
                </>
              ) : (
                <p className="text-gray-400 text-sm">
                  No education info added yet.
                </p>
              )}
            </Card>
          </div>
        )}

        {/* ── SCHOLARSHIPS TAB ────────────────────────────────────────────── */}
        {tab === "scholarships" && (
          <div>
            {scholarships.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🎓</div>
                <p className="font-medium">No scholarships available right now</p>
                <p className="text-sm mt-1">Check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((s) => {
                  const alreadyApplied = appliedIds.has(s._id);
                  const isExpired      = new Date(s.applicationDeadline) < new Date();
                  return (
                    <div
                      key={s._id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900 text-base leading-tight flex-1 mr-2">
                          {s.scholarshipTitle}
                        </h4>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                            SCH_TYPE_COLORS[s.scholarshipType] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.scholarshipType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{s.institutionName}</p>
                      {s.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {s.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 space-y-1 mb-4 mt-auto">
                        <p>
                          📅 Deadline:{" "}
                          {new Date(s.applicationDeadline).toLocaleDateString()}
                        </p>
                        {s.financialDetails?.amount > 0 && (
                          <p>💰 NPR {s.financialDetails.amount.toLocaleString()}</p>
                        )}
                        {s.financialDetails?.totalSlots > 0 && (
                          <p>🪑 {s.financialDetails.availableSlots} slots remaining</p>
                        )}
                      </div>

                      {/* FIX: was /scholarship/${s._id} — route in App.jsx is /scholarships/:id */}
                      <Link
                        to={`/scholarships/${s._id}`}
                        className={`block text-center text-sm font-semibold py-2 rounded-lg transition-colors ${
                          alreadyApplied
                            ? "bg-green-50 text-green-700 cursor-default"
                            : isExpired
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        {alreadyApplied
                          ? "✓ Applied"
                          : isExpired
                          ? "Deadline Passed"
                          : "View & Apply →"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MY APPLICATIONS TAB ─────────────────────────────────────────── */}
        {tab === "applications" && (
          <div>
            {myApplications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📨</div>
                <p className="font-medium">No applications yet</p>
                <p className="text-sm mt-1">
                  Browse scholarships and apply to get started.
                </p>
                <button
                  onClick={() => setTab("scholarships")}
                  className="mt-4 bg-red-500 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-red-600"
                >
                  Browse Scholarships
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myApplications.map((app) => (
                  <div
                    key={app._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-base leading-tight flex-1 mr-2">
                        {app.scholarshipId?.scholarshipTitle || "Scholarship"}
                      </h4>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                          STATUS_COLORS[app.applicationStatus]
                        }`}
                      >
                        {app.applicationStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1 mb-4">
                      <p>Type: {app.applicationType}</p>
                      <p>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                      {app.scholarshipId?.applicationDeadline && (
                        <p>
                          Deadline:{" "}
                          {new Date(
                            app.scholarshipId.applicationDeadline
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {["pending", "under_review"].includes(app.applicationStatus) && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="w-full text-sm font-medium py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}