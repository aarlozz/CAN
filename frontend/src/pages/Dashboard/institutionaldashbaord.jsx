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
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-gray-800 text-sm">{value}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-gray-900 font-bold text-base mb-4 pb-3 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function InstitutionalDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
console.log(data);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Uses protected route: GET /api/institution/dashboard-institution
    axios
      .get(`${API}/api/institution/dashboard-institution`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard.");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/login-institution")}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </>
    );
  }

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

  const statusConfig = {
    approved: {
      text: "✓ Approved",
      className: "bg-green-50 text-green-700",
    },
    pending: {
      text: "⏳ Pending",
      className: "bg-yellow-50 text-yellow-700",
    },
    denied: {
      text: "✗ Denied",
      className: "bg-red-50 text-red-700",
    },
  };
  const currentStatus = statusConfig[data?.status] || statusConfig.pending;


  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {data?.institutionName}
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentStatus.className}`}
              >
                {currentStatus.text}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {data?.institutionType} · {loc.district}, {loc.province}
            </p>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Type", value: data?.institutionType || "—" },
            { label: "Province", value: loc.province || "—" },
            { label: "District", value: loc.district || "—" },
            { label: "Est. Year", value: data?.establishedYear || "—" },
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

        {/* Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institution Info */}
          <Card title="Institution Information">
            <InfoRow label="Institution Name" value={data?.institutionName} />
            <InfoRow label="Type" value={data?.institutionType} />
            <InfoRow label="Established" value={data?.establishedYear} />
            <InfoRow label="Location" value={locationStr} />
            <InfoRow
              label="Website"
              value={
                data?.website ? (
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:underline"
                  >
                    {data.website}
                  </a>
                ) : null
              }
            />
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


          {/* Account & Contact */}
          <div className="flex flex-col gap-6">
            <Card title="Account Details">
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value="Institution" />
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

        {/* Approval notice */}
        {!data?.isApproved && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 text-sm text-yellow-800">
            <strong>Pending Approval —</strong> Your institution is awaiting
            review by CAN administrators. You will be notified once approved.
          </div>
        )}
      </main>

      <Footer />
    </>
    
  );
}
