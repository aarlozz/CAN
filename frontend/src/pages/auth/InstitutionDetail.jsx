// InstitutionDetail.jsx — /institutions/:id
//
// Public institution profile page. Mirrors the structure of a typical
// college-finder profile: dark hero banner + name/type/location, a programs
// section grouped by level, description, and a sticky contact/info sidebar.
//
// GET /api/instituionall/:id → load (public, verified institutions only)

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TYPE_COLORS = {
  School: "bg-blue-50 text-blue-700",
  College: "bg-green-50 text-green-700",
  University: "bg-purple-50 text-purple-700",
};

const LEVEL_ORDER = ["Postgraduate", "Graduate", "Undergraduate", "Diploma", "Certificate"];

function InfoRow({ icon, label, children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 text-sm shrink-0 w-5 text-center">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <div className="text-sm text-gray-800 break-words">{children}</div>
      </div>
    </div>
  );
}

export default function InstitutionDetail() {
  const { id } = useParams();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/api/instituionall/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Institution not found." : "Failed to load institution.");
        return res.json();
      })
      .then((data) => setInstitution(data.institution))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const coursesByLevel = (institution?.courses || []).reduce((acc, c) => {
    const level = c.courseLevel || "Other";
    (acc[level] = acc[level] || []).push(c);
    return acc;
  }, {});

  const orderedLevels = [
    ...LEVEL_ORDER.filter((l) => coursesByLevel[l]),
    ...Object.keys(coursesByLevel).filter((l) => !LEVEL_ORDER.includes(l)),
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-10 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-40 bg-gray-100 rounded-2xl mb-6" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !institution) {
    return (
      <main className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🏫</div>
          <p className="font-semibold text-gray-800 mb-1">{error || "Institution not found."}</p>
          <p className="text-sm text-gray-400 mb-6">
            It may have been removed, or the link may be incorrect.
          </p>
          <Link
            to="/institutions"
            className="inline-block bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            ← Back to Institutions
          </Link>
        </div>
      </main>
    );
  }

  const {
    institutionName,
    institutionType,
    establishedYear,
    location,
    website,
    description,
    contactPerson,
    verification,
  } = institution;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-red-500/20 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10 relative">
          <Link
            to="/institutions"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors mb-6"
          >
            ← All Institutions
          </Link>

          <div className="flex flex-wrap items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg ring-4 ring-white/10">
              {(institutionName || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    TYPE_COLORS[institutionType] || "bg-white/10 text-white"
                  }`}
                >
                  {institutionType}
                </span>
                {verification?.status === "verified" && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                    ✓ Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {institutionName}
              </h1>
              {(location?.district || location?.province) && (
                <p className="text-gray-300 text-sm mt-1">
                  📍 {[location?.municipality, location?.district, location?.province]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">
                About
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                Offered Programs
              </p>
              <span className="text-xs text-gray-400">
                {(institution.courses || []).length} total
              </span>
            </div>

            {(!institution.courses || institution.courses.length === 0) && (
              <p className="text-sm text-gray-400">No programs listed yet.</p>
            )}

            <div className="space-y-6">
              {orderedLevels.map((level) => (
                <div key={level}>
                  <p className="text-xs font-semibold text-gray-500 mb-2.5">{level}</p>
                  <div className="space-y-2.5">
                    {coursesByLevel[level].map((c, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-xl px-4 py-3 hover:border-red-100 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{c.courseName}</p>
                          {c.duration && (
                            <span className="text-xs text-gray-400 shrink-0">{c.duration}</span>
                          )}
                        </div>
                        {c.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {c.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
              Institution Info
            </p>

            <InfoRow icon="🏷️" label="Type">{institutionType}</InfoRow>
            <InfoRow icon="📅" label="Established">{establishedYear}</InfoRow>
            <InfoRow icon="📍" label="Address">
              {[location?.street, location?.municipality, location?.district, location?.province]
                .filter(Boolean)
                .join(", ") || null}
            </InfoRow>
            <InfoRow icon="🌐" label="Website">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline break-all"
                >
                  {website}
                </a>
              )}
            </InfoRow>

            {(contactPerson?.name || contactPerson?.phone || contactPerson?.email) && (
              <>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-5 mb-1">
                  Contact Person
                </p>
                <InfoRow icon="👤" label="Name">
                  {contactPerson?.name}
                  {contactPerson?.designation ? ` — ${contactPerson.designation}` : ""}
                </InfoRow>
                <InfoRow icon="📞" label="Phone">{contactPerson?.phone}</InfoRow>
                <InfoRow icon="✉️" label="Email">
                  {contactPerson?.email && (
                    <a href={`mailto:${contactPerson.email}`} className="text-red-500 hover:underline">
                      {contactPerson.email}
                    </a>
                  )}
                </InfoRow>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}