// pages/Student/ScholarshipBrowse.jsx
//
// Student-facing scholarship search. Replaces "/institutions" as the
// destination for "Browse Scholarships" links — that page filters
// institutions, not scholarships, so it can't answer "which scholarships
// need Computer Science students in Bagmati" style questions.
//
// Suggested route: <Route path="/scholarships" element={<ScholarshipBrowse />} />

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import LocationCascade from "../../Components/LocationCascade";
import {
  STUDY_LEVELS,
  getFacultiesForLevel,
  UNIVERSITIES,
} from "../../constants/educationTaxonomy"// adjust path to wherever this file lives

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SCHOLARSHIP_TYPES = [
  { value: "full_tuition", label: "Full Tuition" },
  { value: "partial_tuition", label: "Partial Tuition" },
  { value: "merit_based", label: "Merit Based" },
  { value: "need_based", label: "Need Based" },
  { value: "disability", label: "Disability" },
  { value: "gender", label: "Gender" },
  { value: "ethnic", label: "Ethnic" },
];

const TYPE_COLORS = {
  full_tuition: "bg-teal-50 text-teal-700",
  partial_tuition: "bg-cyan-50 text-cyan-700",
  merit_based: "bg-blue-50 text-blue-700",
  need_based: "bg-orange-50 text-orange-700",
  disability: "bg-purple-50 text-purple-700",
  gender: "bg-pink-50 text-pink-700",
  ethnic: "bg-yellow-50 text-yellow-700",
};

const EMPTY_FILTERS = {
  search: "",
  subject: "",
  targetLevel: "",
  targetFaculty: "",
  university: "",
  scholarshipType: "",
  gender: "",
  province: "",
  district: "",
  municipality: "",
};

function FilterSection({ title, children }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function SeatsBar({ remaining, total }) {
  if (!total) return <span className="text-xs text-gray-400">—</span>;
  const pct = Math.round(((remaining ?? total) / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">
        {remaining ?? total}/{total}
      </span>
    </div>
  );
}

export default function ScholarshipBrowse() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [scholarships, setScholarships] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400";
  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";

  const facultyOptions = useMemo(
    () => (filters.targetLevel ? getFacultiesForLevel(filters.targetLevel) : []),
    [filters.targetLevel],
  );

  const fetchScholarships = async (f = filters, p = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(f).filter(([, v]) => v !== ""),
      );
      params.page = p;
      params.limit = 12;

      const res = await axios.get(`${API}/api/scholarship/all`, { params });
      setScholarships(res.data.scholarships || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load scholarships.",
      );
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced re-fetch on filter change, reset to page 1
  useEffect(() => {
    const t = setTimeout(() => fetchScholarships(filters, 1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const setField = (field) => (e) =>
    setFilters((f) => ({ ...f, [field]: e.target.value }));

  // Changing level should reset faculty, since faculty options depend on it
  const setLevel = (e) =>
    setFilters((f) => ({ ...f, targetLevel: e.target.value, targetFaculty: "" }));

  const clearAll = () => setFilters(EMPTY_FILTERS);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const FilterPanel = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5">
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <p className="font-bold text-gray-900 text-sm">Filters</p>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-red-500 hover:text-red-600"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Subject">
        <input
          type="text"
          placeholder="e.g. Computer Science, Nursing…"
          value={filters.subject}
          onChange={setField("subject")}
          className={inputCls}
        />
      </FilterSection>

      <FilterSection title="Study Level">
        <select value={filters.targetLevel} onChange={setLevel} className={selectCls}>
          <option value="">Any Level</option>
          {STUDY_LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </FilterSection>

      {facultyOptions.length > 0 && (
        <FilterSection title="Faculty">
          <select
            value={filters.targetFaculty}
            onChange={setField("targetFaculty")}
            className={selectCls}
          >
            <option value="">Any Faculty</option>
            {facultyOptions.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      <FilterSection title="University">
        <select
          value={filters.university}
          onChange={setField("university")}
          className={selectCls}
        >
          <option value="">Any University</option>
          {UNIVERSITIES.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Scholarship Type">
        <select
          value={filters.scholarshipType}
          onChange={setField("scholarshipType")}
          className={selectCls}
        >
          <option value="">Any Type</option>
          {SCHOLARSHIP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Gender Eligibility">
        <select value={filters.gender} onChange={setField("gender")} className={selectCls}>
          <option value="">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </FilterSection>

      <FilterSection title="Location">
        <LocationCascade
          idMode="name"
          province={filters.province}
          district={filters.district}
          municipality={filters.municipality}
          onChange={({ province, district, municipality }) =>
            setFilters((f) => ({ ...f, province, district, municipality }))
          }
          gridClassName="grid grid-cols-1 gap-3"
        />
      </FilterSection>
    </div>
  );

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Browse Scholarships
          </h1>
          <p className="text-gray-500 mt-1">
            Search open scholarships by subject, level, and location.
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search scholarship title or description…"
            value={filters.search}
            onChange={setField("search")}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden shrink-0 flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
            {FilterPanel}
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-50 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Filters</p>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
                  >
                    ×
                  </button>
                </div>
                {FilterPanel}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Show {total} results
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full" />
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <p className="text-sm text-gray-400 mb-4">
                Showing {scholarships.length} of {total} scholarships
              </p>
            )}

            {!loading && !error && scholarships.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🎓</div>
                <p className="font-medium">No scholarships match these filters</p>
                <button
                  onClick={clearAll}
                  className="mt-3 text-sm text-red-500 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {scholarships.map((s) => (
                <Link
                  key={s._id}
                  to={`/scholarships/${s._id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-red-100 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1 group-hover:text-red-600 transition-colors">
                      {s.scholarshipTitle}
                    </h4>
                    {s.coverage?.scholarshipType2 && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          TYPE_COLORS[s.coverage.scholarshipType2] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.coverage.scholarshipType2.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    {s.institutionName || "Institution"}
                  </p>
                  {s.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                  <div className="space-y-1.5 mb-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span>📅</span>
                      Deadline:{" "}
                      {new Date(s.applicationDeadline).toLocaleDateString("en-NP", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {s.coverage?.amountNpr > 0 && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>💰</span> NPR {s.coverage.amountNpr.toLocaleString()}
                      </p>
                    )}
                    {s.coverage?.percentage > 0 && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>📊</span> {s.coverage.percentage}% coverage
                      </p>
                    )}
                    {s.eligibilityCriteria?.subject && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>📚</span> {s.eligibilityCriteria.subject}
                      </p>
                    )}
                    {s.eligibilityCriteria?.targetLevel && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 capitalize">
                        <span>🎓</span>{" "}
                        {s.eligibilityCriteria.targetLevel.replace("_", " ")}
                      </p>
                    )}
                    {s.totalSeats > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">🪑</span>
                        <SeatsBar remaining={s.remainingSeats} total={s.totalSeats} />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchScholarships(filters, page - 1)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page {page} of {pages}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => fetchScholarships(filters, page + 1)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}