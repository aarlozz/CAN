// institutionaldashbaord.jsx — Institution dashboard (older auth pattern)
//
// FIXES IN THIS FILE:
// Promise.all was used for all 3 fetches. /api/scholarship/my was hitting
// /api/scholarships/my (wrong plural in app.js) → 404 → crashed entire dashboard.
// Even after app.js is fixed, Promise.all means any single failure kills everything.
// Now each fetch is independent: profile failure shows error, scholarship/application
// failures show empty state instead of crashing the whole dashboard.
//
// NEW: Scholarships tab now supports table/grid view toggle.

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import ViewToggle from "../../Components/ViewToggle";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-44 shrink-0">{label}</span>
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

const TYPE_COLORS = {
  merit:       "bg-blue-50 text-blue-700",
  reservation: "bg-purple-50 text-purple-700",
  both:        "bg-green-50 text-green-700",
};

// ── Scholarship Grid Card ────────────────────────────────────────
function ScholarshipGridCard({ s, onDelete }) {
  const isExpired = new Date(s.applicationDeadline) < new Date();
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-gray-900 text-sm leading-snug flex-1">
          {s.scholarshipTitle}
        </h4>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[s.scholarshipType] ?? "bg-gray-100 text-gray-500"}`}>
          {s.scholarshipType}
        </span>
      </div>
      {s.description && (
        <p className="text-gray-500 text-xs line-clamp-2">{s.description}</p>
      )}
      <div className="text-sm text-gray-500 space-y-1">
        <p className={isExpired ? "text-red-500" : ""}>
          📅 {new Date(s.applicationDeadline).toLocaleDateString()}
          {isExpired && <span className="ml-1 text-xs">(expired)</span>}
        </p>
        {s.financialDetails?.amount > 0 && (
          <p>💰 NPR {s.financialDetails.amount.toLocaleString()}</p>
        )}
        {s.financialDetails?.totalSlots > 0 && (
          <p>🪑 {s.financialDetails.availableSlots ?? "?"} / {s.financialDetails.totalSlots} slots</p>
        )}
        <p>📝 {s.statistics?.totalApplications || 0} applications</p>
      </div>
      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
        <Link
          to={`/scholarships/${s._id}`}
          className="flex-1 text-center text-xs font-medium py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(s._id)}
          className="flex-1 text-xs font-medium py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Scholarship Table Row ────────────────────────────────────────
function ScholarshipTableRow({ s, onDelete }) {
  const isExpired = new Date(s.applicationDeadline) < new Date();
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
        {s.scholarshipTitle}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[s.scholarshipType] ?? "bg-gray-100 text-gray-500"}`}>
          {s.scholarshipType}
        </span>
      </td>
      <td className={`px-4 py-3 text-sm ${isExpired ? "text-red-500" : "text-gray-500"}`}>
        {new Date(s.applicationDeadline).toLocaleDateString()}
        {isExpired && <span className="ml-1 text-xs">(expired)</span>}
      </td>
      {s.financialDetails?.amount > 0 && (
        <td className="px-4 py-3 text-sm text-gray-500">
          NPR {s.financialDetails.amount.toLocaleString()}
        </td>
      )}
      <td className="px-4 py-3 text-sm text-gray-500">
        {s.statistics?.totalApplications || 0}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Link
            to={`/scholarships/${s._id}`}
            className="text-xs font-medium py-1 px-2 border border-gray-200 rounded text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors"
          >
            View
          </Link>
          <button
            onClick={() => onDelete(s._id)}
            className="text-xs font-medium py-1 px-2 border border-red-100 rounded text-red-500 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function InstitutionalDashboard() {
  const navigate = useNavigate();
  const [data, setData]                   = useState(null);
  const [scholarships, setScholarships]   = useState([]);
  const [applications, setApplications]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [tab, setTab]                     = useState("profile");

  // ── View mode for scholarships tab: 'grid' | 'table' ────────
  const [schViewMode, setSchViewMode]     = useState("grid");

  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [schForm, setSchForm] = useState({
    scholarshipTitle: "",
    description: "",
    scholarshipType: "merit",
    applicationDeadline: "",
    financialDetails: { amount: "", totalSlots: "" },
    requirements: { eligibilityCriteria: "", additionalRequirements: "" },
  });
  const [schLoading, setSchLoading] = useState(false);
  const [schError, setSchError]     = useState("");

  const token = localStorage.getItem("token");

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";

  useEffect(() => {
    if (!token) { navigate("/login-institution"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    const profileReq = axios
      .get(`${API}/api/institution/dashboard-institution`, { headers })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login-institution");
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard.");
        }
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
      setLoading(false)
    );
  }, [navigate, token]);

  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setSchError("");
    setSchLoading(true);
    try {
      const payload = {
        ...schForm,
        financialDetails: {
          amount:     Number(schForm.financialDetails.amount)     || 0,
          totalSlots: Number(schForm.financialDetails.totalSlots) || 0,
        },
      };
      const res = await axios.post(`${API}/api/scholarship/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScholarships((prev) => [res.data.scholarship, ...prev]);
      setShowScholarshipForm(false);
      setSchForm({
        scholarshipTitle: "",
        description: "",
        scholarshipType: "merit",
        applicationDeadline: "",
        financialDetails: { amount: "", totalSlots: "" },
        requirements: { eligibilityCriteria: "", additionalRequirements: "" },
      });
    } catch (err) {
      setSchError(err.response?.data?.message || "Failed to create scholarship.");
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
        prev.map((a) => (a._id === appId ? { ...a, applicationStatus: status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
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
            onClick={() => navigate("/login-institution")}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600"
          >
            Back to Login
          </button>
        </div>
      </>
    );

  const loc        = data?.location || {};
  const contact    = data?.contactPerson || {};
  const user       = data?.user || {};
  const locationStr = [
    loc.street,
    loc.ward && `Ward ${loc.ward}`,
    loc.municipality,
    loc.district,
    loc.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{data?.institutionName}</h1>
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
            { label: "Pending", value: applications.filter((a) => a.applicationStatus === "pending").length },
            { label: "Approved", value: applications.filter((a) => a.applicationStatus === "approved").length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-red-500">{value}</p>
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
                tab === t ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ──────────────────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Institution Information">
              <InfoRow label="Name"        value={data?.institutionName} />
              <InfoRow label="Type"        value={data?.institutionType} />
              <InfoRow label="Established" value={data?.establishedYear} />
              <InfoRow label="Location"    value={locationStr} />
              <InfoRow label="Website"     value={data?.website} />
              {data?.description && (
                <div className="pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{data.description}</p>
                </div>
              )}
            </Card>
            <div className="flex flex-col gap-6">
              <Card title="Account Details">
                <InfoRow label="Name"  value={user.name} />
                <InfoRow label="Email" value={user.email} />
              </Card>
              <Card title="Contact Person">
                {contact.name ? (
                  <>
                    <InfoRow label="Name"        value={contact.name} />
                    <InfoRow label="Designation" value={contact.designation} />
                    <InfoRow label="Phone"       value={contact.phone} />
                    <InfoRow label="Email"       value={contact.email} />
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">No contact person added.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS TAB ─────────────────────────────────────────────── */}
        {tab === "scholarships" && (
          <div>
            {/* Tab header: post button + view toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">
                  {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''}
                </h3>
                {/* View toggle — only when there's content */}
                {scholarships.length > 0 && (
                  <ViewToggle viewMode={schViewMode} onToggle={setSchViewMode} />
                )}
              </div>
              <button
                onClick={() => setShowScholarshipForm(!showScholarshipForm)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {showScholarshipForm ? "Cancel" : "+ Post Scholarship"}
              </button>
            </div>

            {/* Create form */}
            {showScholarshipForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  New Scholarship
                </h3>
                {schError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                    {schError}
                  </div>
                )}
                <form
                  onSubmit={handleScholarshipSubmit}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Title *</label>
                    <input
                      className={inputCls}
                      required
                      value={schForm.scholarshipTitle}
                      onChange={(e) => setSchForm((f) => ({ ...f, scholarshipTitle: e.target.value }))}
                      placeholder="e.g. Merit Scholarship 2025"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className={inputCls + " resize-none"}
                      rows={3}
                      value={schForm.description}
                      onChange={(e) => setSchForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the scholarship..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      className={inputCls}
                      value={schForm.scholarshipType}
                      onChange={(e) => setSchForm((f) => ({ ...f, scholarshipType: e.target.value }))}
                    >
                      <option value="merit">Merit</option>
                      <option value="reservation">Reservation</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
                    <input
                      className={inputCls}
                      type="date"
                      required
                      value={schForm.applicationDeadline}
                      onChange={(e) => setSchForm((f) => ({ ...f, applicationDeadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NPR)</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      value={schForm.financialDetails.amount}
                      onChange={(e) => setSchForm((f) => ({ ...f, financialDetails: { ...f.financialDetails, amount: e.target.value } }))}
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="1"
                      value={schForm.financialDetails.totalSlots}
                      onChange={(e) => setSchForm((f) => ({ ...f, financialDetails: { ...f.financialDetails, totalSlots: e.target.value } }))}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                    <textarea
                      className={inputCls + " resize-none"}
                      rows={2}
                      value={schForm.requirements.eligibilityCriteria}
                      onChange={(e) => setSchForm((f) => ({ ...f, requirements: { ...f.requirements, eligibilityCriteria: e.target.value } }))}
                      placeholder="Who can apply?"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowScholarshipForm(false)}
                      className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={schLoading}
                      className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300"
                    >
                      {schLoading ? "Posting…" : "Post Scholarship"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Empty state ──────────────────────────────────── */}
            {scholarships.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📋</div>
                <p className="font-medium">No scholarships posted yet</p>
                <p className="text-sm mt-1">Click "+ Post Scholarship" to create your first one.</p>
              </div>

            /* ── GRID VIEW ───────────────────────────────────── */
            ) : schViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scholarships.map((s) => (
                  <ScholarshipGridCard key={s._id} s={s} onDelete={handleDeleteScholarship} />
                ))}
              </div>

            /* ── TABLE VIEW ──────────────────────────────────── */
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deadline</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Apps</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {scholarships.map((s) => (
                        <ScholarshipTableRow key={s._id} s={s} onDelete={handleDeleteScholarship} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── APPLICATIONS TAB ─────────────────────────────────────────────── */}
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Scholarship</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {app.studentSnapshot?.fullName || "—"}
                          <div className="text-xs text-gray-400">{app.studentSnapshot?.location?.district}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {app.scholarshipId?.scholarshipTitle || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[app.applicationType]}`}>
                            {app.applicationType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            app.applicationStatus === "approved"   ? "bg-green-50 text-green-700"
                            : app.applicationStatus === "rejected"  ? "bg-red-50 text-red-700"
                            : app.applicationStatus === "under_review" ? "bg-blue-50 text-blue-700"
                            : app.applicationStatus === "withdrawn" ? "bg-gray-100 text-gray-500"
                            : "bg-yellow-50 text-yellow-700"
                          }`}>
                            {app.applicationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.applicationStatus === "pending" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleReview(app._id, "approved")} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>
                              <button onClick={() => handleReview(app._id, "under_review")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Review</button>
                              <button onClick={() => handleReview(app._id, "rejected")} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">Reject</button>
                            </div>
                          )}
                          {app.applicationStatus === "under_review" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleReview(app._id, "approved")} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>
                              <button onClick={() => handleReview(app._id, "rejected")} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">Reject</button>
                            </div>
                          )}
                          {["approved", "rejected", "withdrawn"].includes(app.applicationStatus) && (
                            <span className="text-xs text-gray-400">No actions</span>
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