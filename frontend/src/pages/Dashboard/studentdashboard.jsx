import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) { navigate("/login"); return; }
  if (role !== "student") { navigate("/"); return; }

  // Dashboard data
  axios
    .get(`${API}/api/student/dashboard-student`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setData(res.data))
    .catch((err) => {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to load your profile.");
      }
    })
    .finally(() => setLoading(false));

  // 🔥 Applications API
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </>
    );
  }

  const user = data?.user || {};
  const personal = data?.personal_info || {};
  const address = data?.address || {};
  const guardian = data?.guardian_info || {};

  const addressStr = [
    address.street,
    address.ward && `Ward ${address.ward}`,
    address.municipality,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

  const dobFormatted = personal.dob
    ? new Date(personal.dob).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-xl font-bold text-red-500">
                {user.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Province", value: address.province || "—" },
            { label: "District", value: address.district || "—" },
            { label: "Gender", value: personal.gender || "—" },
            { label: "Role", value: "Student" },
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

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card title="Personal Information" icon="👤">
            <InfoRow label="Full Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Date of Birth" value={dobFormatted} />
            <InfoRow label="Gender" value={personal.gender} />
            <InfoRow label="Phone" value={personal.phone} />
          </Card>

          {/* Address */}
          <Card title="Address" icon="📍">
            <InfoRow label="Province" value={address.province} />
            <InfoRow label="District" value={address.district} />
            <InfoRow label="Municipality" value={address.municipality} />
            <InfoRow label="Ward" value={address.ward} />
            <InfoRow label="Street" value={address.street} />
            {!addressStr && (
              <p className="text-gray-400 text-sm">No address information provided.</p>
            )}
          </Card>

          {/* Guardian Info */}
          <Card title="Guardian Information" icon="👨‍👩‍👦">
            {guardian.name ? (
              <>
                <InfoRow label="Name" value={guardian.name} />
                <InfoRow label="Relation" value={guardian.relation} />
                <InfoRow label="Phone" value={guardian.phone_number} />
                <InfoRow label="Occupation" value={guardian.occupation} />
              </>
            ) : (
              <p className="text-gray-400 text-sm">No guardian information provided.</p>
            )}
          </Card>

          <Card title="My Scholarships" icon="🎓">
  {appLoading ? (
    <p className="text-gray-400 text-sm">Loading applications...</p>
  ) : applications.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="text-3xl mb-2">📭</div>
      <p className="text-gray-500 text-sm mb-3">No applications yet</p>
      <a
        href="/institutions"
        className="text-red-500 text-sm font-semibold hover:underline"
      >
        Browse Scholarships →
      </a>
    </div>
  ) : (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app._id}
          className="flex justify-between items-center p-3 border border-gray-100 rounded-lg"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {app.scholarshipName}
            </p>
            <p className="text-xs text-gray-400">
              {app.institutionName}
            </p>
          </div>

          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              app.status === "approved"
                ? "bg-green-100 text-green-600"
                : app.status === "rejected"
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {app.status}
          </span>
        </div>
      ))}
    </div>
  )}
</Card>
        </div>
      </main>
      <Footer />
    </>
  );
}