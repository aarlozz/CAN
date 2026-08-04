import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import LocationCascade from "../../Components/LocationCascade";
import {
  STUDY_LEVELS,
  LEVELS_WITH_FACULTY,
  getFacultiesForLevel,
  getProgramsForFaculty,
  UNIVERSITIES,
  COLLEGE_TYPES,
} from "../../constants/educationTaxonomy";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHOLARSHIP_TYPES = [
  { value: "full_tuition", label: "Full Tuition" },
  { value: "partial_tuition", label: "Partial Tuition" },
  { value: "merit_based", label: "Merit Based" },
  { value: "need_based", label: "Need Based" },
  { value: "disability", label: "Disability" },
  { value: "gender", label: "Gender" },
  { value: "ethnic", label: "Ethnic" },
];

// STUDY_LEVELS (v2) items look like { id, name, hasFaculty, ... } — normalize
// to the { value, label } shape the filter selects expect.
const TARGET_LEVELS = STUDY_LEVELS.map((l) => ({ value: l.id, label: l.name }));

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "any", label: "Any" },
];

// Mirrors the real category system used by Nepal government / TU scholarships
const ETHNIC_CATEGORY_OPTIONS = [
  { value: "dalit", label: "Dalit" },
  { value: "janajati", label: "Janajati" },
  { value: "madhesi", label: "Madhesi" },
  { value: "muslim", label: "Muslim" },
  { value: "backward_region", label: "Backward Region" },
  { value: "general", label: "General" },
];

const TYPE_BADGE = {
  full_tuition: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial_tuition: "bg-sky-50 text-sky-700 border-sky-200",
  merit_based: "bg-blue-50 text-blue-700 border-blue-200",
  need_based: "bg-amber-50 text-amber-700 border-amber-200",
  disability: "bg-purple-50 text-purple-700 border-purple-200",
  gender: "bg-pink-50 text-pink-700 border-pink-200",
  ethnic: "bg-orange-50 text-orange-700 border-orange-200",
};

const TYPE_LABEL = {
  full_tuition: "Full Tuition",
  partial_tuition: "Partial Tuition",
  merit_based: "Merit Based",
  need_based: "Need Based",
  disability: "Disability",
  gender: "Gender",
  ethnic: "Ethnic",
};

// id -> display name, e.g. LEVEL_LABEL["bachelor"] === "Bachelor's"
const LEVEL_LABEL = Object.fromEntries(STUDY_LEVELS.map((l) => [l.id, l.name]));

const COLLEGE_TYPE_LABEL = Object.fromEntries(
  COLLEGE_TYPES.map((c) => [c.value, c.label]),
);

// UNIVERSITIES (v2) is a flat array of { id, name, shortName, group,
// hasOwnPlusTwo } — `group` is "nepal" | "foreign_affiliation". Bucket it
// into the { group, options: [{value,label}] } shape FilterGroupedSelect
// renders as <optgroup>s.
const UNIVERSITY_GROUP_LABELS = {
  nepal: "Nepal",
  foreign_affiliation: "Foreign Affiliation",
};

const UNIVERSITY_GROUPS = Object.entries(
  UNIVERSITIES.reduce((acc, u) => {
    (acc[u.group] ||= []).push({ value: u.id, label: u.name });
    return acc;
  }, {}),
).map(([group, options]) => ({
  group: UNIVERSITY_GROUP_LABELS[group] || group,
  options,
}));

// id -> display name, e.g. UNIVERSITY_LABEL["ku"] === "Kathmandu University"
const UNIVERSITY_LABEL = Object.fromEntries(UNIVERSITIES.map((u) => [u.id, u.name]));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatNPR = (n) => `NPR ${Number(n).toLocaleString("en-NP")}`;

const deadlineInfo = (d) => {
  const deadline = new Date(d);
  const now = new Date();
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)
    return { label: "Deadline passed", color: "text-red-500", expired: true };
  if (diff <= 7)
    return { label: `${diff}d left`, color: "text-orange-500", expired: false };
  return {
    label: deadline.toLocaleDateString("en-NP", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    color: "text-gray-500",
    expired: false,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
  disabled = false,
  hint = "",
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-gray-700 ${
          disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""
        }`}
      >
        <option value="">{placeholder}</option>
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {disabled && hint && (
        <span className="text-[11px] text-gray-400">{hint}</span>
      )}
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
      />
    </div>
  );
}

// Select with <optgroup> support — used for University, which is grouped
// (Nepal / Foreign Affiliation) rather than a flat list. `groups` is
// [{ group: string, options: [{ value, label }] }].
function FilterGroupedSelect({ label, value, onChange, groups, placeholder = "All" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-gray-700"
      >
        <option value="">{placeholder}</option>
        {(groups || []).map((g) => (
          <optgroup key={g.group} label={g.group}>
            {(g.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

// Active filter chips
function ActiveFilters({ filters, labels, onRemove, onClearAll }) {
  const active = Object.entries(filters).filter(
    ([, v]) => v !== "" && v !== false && v !== null,
  );
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-gray-400 font-medium">Active filters:</span>
      {active.map(([key, val]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full"
        >
          {labels[key] || key}: {typeof val === "boolean" ? "Yes" : val}
          <button
            onClick={() => onRemove(key)}
            className="ml-0.5 hover:text-red-900 font-bold"
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-gray-400 hover:text-red-500 underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

// ─── Card View ────────────────────────────────────────────────────────────────

function ScholarshipCard({ s }) {
  const dl = deadlineInfo(s.applicationDeadline);
  const type = s.coverage?.scholarshipType;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-red-100 transition-all duration-200 group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1 group-hover:text-red-600 transition-colors">
          {s.scholarshipTitle}
        </h3>
        {type && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${TYPE_BADGE[type] || "bg-gray-100 text-gray-600 border-gray-200"}`}
          >
            {TYPE_LABEL[type] || type}
          </span>
        )}
      </div>

      {/* Institution */}
      <p className="text-xs font-semibold text-gray-500 mb-1">
        🏫 {s.institutionName}
      </p>

      {/* Level + Faculty */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {s.eligibilityCriteria?.targetLevel && (
          <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {LEVEL_LABEL[s.eligibilityCriteria.targetLevel] ||
              s.eligibilityCriteria.targetLevel}
          </span>
        )}
        {s.eligibilityCriteria?.targetFaculty && (
          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {s.eligibilityCriteria.targetFaculty}
          </span>
        )}
        {s.eligibilityCriteria?.subject && (
          <span className="bg-teal-50 text-teal-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {s.eligibilityCriteria.subject}
          </span>
        )}
        {s.eligibilityCriteria?.gender &&
          s.eligibilityCriteria.gender !== "any" && (
            <span className="bg-pink-50 text-pink-600 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
              {s.eligibilityCriteria.gender}
            </span>
          )}
        {s.eligibilityCriteria?.ethnicCategory &&
          s.eligibilityCriteria.ethnicCategory !== "any" && (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
              {s.eligibilityCriteria.ethnicCategory.replace("_", " ")}
            </span>
          )}
        {s.eligibilityCriteria?.minGPA != null && (
          <span className="bg-cyan-50 text-cyan-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Min GPA {s.eligibilityCriteria.minGPA}
          </span>
        )}
        {s.eligibilityCriteria?.minPercentage != null && (
          <span className="bg-cyan-50 text-cyan-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Min {s.eligibilityCriteria.minPercentage}%
          </span>
        )}
        {s.eligibilityCriteria?.entranceExamName && (
          <span className="bg-violet-50 text-violet-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {s.eligibilityCriteria.entranceExamName}
            {s.eligibilityCriteria.minEntranceScore != null &&
              ` ≥ ${s.eligibilityCriteria.minEntranceScore}`}
          </span>
        )}
      </div>

      {s.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {s.description}
        </p>
      )}

      {/* Stats row */}
      <div className="mt-auto space-y-1 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${dl.color}`}>📅 {dl.label}</span>
          {(s.coverage?.amountNpr > 0 || s.coverage?.percentage > 0) && (
            <span className="text-gray-600 font-semibold">
              💰{" "}
              {s.coverage?.amountNpr > 0
                ? formatNPR(s.coverage.amountNpr)
                : `${s.coverage.percentage}%`}
              {s.coverage?.amountNpr > 0 &&
                s.coverage?.percentage > 0 &&
                ` (${s.coverage.percentage}%)`}
            </span>
          )}
        </div>
        {s.coverage?.totalProgramFeeNpr > 0 && (
          <p className="text-xs text-gray-400">
            🎓 Program fee: {formatNPR(s.coverage.totalProgramFeeNpr)}
          </p>
        )}
        
        {s.locationFilter?.province?.provinceName && (
          <p className="text-xs text-gray-400">
            📍 {s.locationFilter.province.provinceName}
            {s.locationFilter.district?.districtName
              ? `, ${s.locationFilter.district.districtName}`
              : ""}
          </p>
        )}
      </div>

      <Link
        to={`/scholarships/${s._id}`}
        className="block text-center bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
      >
        View Details →
      </Link>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

function ScholarshipTable({ scholarships }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {[
              "Scholarship",
              "Institution",
              "Type",
              "Level",
              "Faculty / Subject",
              "Amount",
              "Seats",
              "Deadline",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {scholarships.map((s) => {
            const dl = deadlineInfo(s.applicationDeadline);
            const type = s.coverage?.scholarshipType;
            return (
              <tr
                key={s._id}
                className="bg-white hover:bg-red-50/30 transition-colors group"
              >
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="font-semibold text-gray-900 text-xs leading-snug group-hover:text-red-600 line-clamp-2">
                    {s.scholarshipTitle}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap max-w-[160px] truncate">
                  {s.institutionName}
                </td>
                <td className="px-4 py-3">
                  {type && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_BADGE[type] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {TYPE_LABEL[type] || type}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                  {LEVEL_LABEL[s.eligibilityCriteria?.targetLevel] ||
                    s.eligibilityCriteria?.targetLevel ||
                    "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px]">
                  <div>{s.eligibilityCriteria?.targetFaculty || ""}</div>
                  {s.eligibilityCriteria?.subject && (
                    <div className="text-teal-600">
                      {s.eligibilityCriteria.subject}
                    </div>
                  )}
                  {!s.eligibilityCriteria?.targetFaculty &&
                    !s.eligibilityCriteria?.subject &&
                    "—"}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                  {s.coverage?.amountNpr > 0
                    ? formatNPR(s.coverage.amountNpr)
                    : s.coverage?.percentage > 0
                      ? `${s.coverage.percentage}%`
                      : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {s.remainingSeats != null
                    ? `${s.remainingSeats}/${s.totalSeats}`
                    : "—"}
                </td>
                <td
                  className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${dl.color}`}
                >
                  {dl.label}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/scholarships/${s._id}`}
                    className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_LABELS = {
  search: "Search",
  scholarshipType: "Type",
  targetLevel: "Level",
  targetFaculty: "Faculty",
  degreeProgram: "Degree/Program",
  university: "University",
  collegeType: "College Type",
  subject: "Subject",
  gender: "Gender",
  hasDisability: "Disability",
  provinceId: "Province",
  districtId: "District",
  municipalityId: "Municipality",
  status: "Status",
  minAmount: "Min Amount",
  maxAmount: "Max Amount",
  ethnicCategory: "Category",
  minGPA: "Your GPA",
  minPercentage: "Your Percentage",
  studentAge: "Your Age",
};

const DEFAULT_FILTERS = {
  // Free-text search — now sent to the backend and matched against title,
  // institution, description, AND targetLevel/targetFaculty/degreeProgram/
  // university/subject. So typing "BE Computer", "Master's", or "Bachelors"
  // finds scholarships by what a student is studying, not just by name.
  search: "",
  scholarshipType: "",
  targetLevel: "",
  targetFaculty: "",
  degreeProgram: "",
  university: "",
  collegeType: "",
  subject: "",
  gender: "",
  hasDisability: false,
  provinceId: "",
  districtId: "",
  municipalityId: "",
  status: "active",
  minAmount: "",
  maxAmount: "",
  // Self-reported by the student — used to surface scholarships they
  // actually qualify for (e.g. "my GPA is Y", "I'm in category Z")
  ethnicCategory: "",
  minGPA: "",
  minPercentage: "",
  studentAge: "",
};

export default function ScholarshipList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // View mode
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("schViewMode") || "card",
  );

  // Scholarship data
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Panel toggle
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters (backend) — includes `search` now
  const [filters, setFilters] = useState(() => {
    const f = { ...DEFAULT_FILTERS };
    for (const key of Object.keys(DEFAULT_FILTERS)) {
      const v = searchParams.get(key);
      if (v !== null) f[key] = key === "hasDisability" ? v === "true" : v;
    }
    return f;
  });

  // ── Search box: local input state + debounce into filters.search ───────────
  // Typing updates `searchInput` immediately (so the box feels responsive),
  // but the actual backend request (via filters.search) only fires 400ms
  // after the person stops typing, so we don't spam the API on every
  // keystroke.
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchInput ? prev : { ...prev, search: searchInput },
      );
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // ── Cascade-derived options ─────────────────────────────────────────────────
  // Faculty options depend on the selected Level; Program options depend on
  // Level + Faculty. Mirrors the Level → Faculty → Program hierarchy in
  // educationTaxonomy.js, same pattern as the province/district/municipality
  // cascade used below for location.
  //
  // NOTE: getFacultiesForLevel / getProgramsForFaculty return full objects
  // ({ id, name, ... }), not plain strings — map id -> value, name -> label.
  const levelHasFaculty = LEVELS_WITH_FACULTY.includes(filters.targetLevel);
  const facultyOptions = levelHasFaculty
    ? getFacultiesForLevel(filters.targetLevel).map((f) => ({
        value: f.id,
        label: f.name,
      }))
    : [];
  const programOptions =
    levelHasFaculty && filters.targetFaculty
      ? getProgramsForFaculty(filters.targetLevel, filters.targetFaculty).map(
          (p) => ({ value: p.id, label: p.name }),
        )
      : [];

  // ── Sync filters → URL ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v !== "" && v !== false && v !== null) params[k] = String(v);
    }
    setSearchParams(params, { replace: true });
  }, [filters]);

  // ── Fetch scholarships ──────────────────────────────────────────────────────
  const fetchScholarships = useCallback(
    (p = 1) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: p, limit: 12 });

      const MAP = {
        search: "search",
        scholarshipType: "scholarshipType",
        targetLevel: "targetLevel",
        targetFaculty: "targetFaculty",
        degreeProgram: "degreeProgram",
        university: "university",
        collegeType: "collegeType",
        subject: "subject",
        gender: "gender",
        hasDisability: "hasDisability",
        provinceId: "provinceId",
        districtId: "districtId",
        municipalityId: "municipalityId",
        status: "status",
        minAmount: "minAmount",
        maxAmount: "maxAmount",
        ethnicCategory: "ethnicCategory",
        minGPA: "minGPA",
        minPercentage: "minPercentage",
        studentAge: "studentAge",
      };

      for (const [fk, pk] of Object.entries(MAP)) {
        const v = filters[fk];
        if (v !== "" && v !== false && v != null) params.set(pk, v);
      }

      axios
        .get(`${API}/api/scholarship/all?${params}`)
        .then((res) => {
          setScholarships(res.data.scholarships || []);
          setTotalPages(res.data.pages || 1);
          setTotalCount(res.data.total || 0);
          setPage(p);
        })
        .catch((err) =>
          setError(
            err.response?.data?.message || "Failed to load scholarships.",
          ),
        )
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    fetchScholarships(1);
  }, [filters]);

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const setFilter = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      // Cascade reset: Level → Faculty → Program (same idea as location)
      if (key === "targetLevel") {
        next.targetFaculty = "";
        next.degreeProgram = "";
      }
      if (key === "targetFaculty") {
        next.degreeProgram = "";
      }

      // Reset cascading location
      if (key === "provinceId") {
        next.districtId = "";
        next.municipalityId = "";
      }
      if (key === "districtId") {
        next.municipalityId = "";
      }
      return next;
    });
  };

  const removeFilter = (key) => {
    if (key === "search") setSearchInput("");
    setFilter(key, DEFAULT_FILTERS[key]);
  };

  const clearAll = () => {
    setSearchInput("");
    setFilters({ ...DEFAULT_FILTERS });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v !== "" && v !== false && v !== null,
  ).length;

  // Backend already applies `search` (title/institution/description/level/
  // faculty/degree/university/subject), so results just render as-is —
  // no separate client-side re-filtering needed anymore.
  const filtered = scholarships;

  // ── View mode toggle ────────────────────────────────────────────────────────
  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem("schViewMode", mode);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Scholarships
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Browse verified scholarships from institutions across Nepal
          {totalCount > 0 && !loading && (
            <span className="ml-2 bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalCount} found
            </span>
          )}
        </p>
      </div>

      {/* ── Search + View Toggle + Filter Button ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search — now hits the backend (debounced) and matches degree,
            faculty, level, and university too, not just title/institution.
            e.g. "BE Computer", "Master's", "Bachelors" all work. */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, institution, degree, or level"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          {/* Filter toggle button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              filtersOpen
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-red-500 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View mode toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleView("card")}
              title="Card view"
              className={`px-3 py-2.5 transition-colors ${viewMode === "card" ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              {/* Grid icon */}
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => toggleView("table")}
              title="Table view"
              className={`px-3 py-2.5 transition-colors ${viewMode === "table" ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              {/* List icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {filtersOpen && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <FilterSelect
              label="Scholarship Type"
              value={filters.scholarshipType}
              onChange={(v) => setFilter("scholarshipType", v)}
              options={SCHOLARSHIP_TYPES}
            />

            <FilterSelect
              label="Target Level"
              value={filters.targetLevel}
              onChange={(v) => setFilter("targetLevel", v)}
              options={TARGET_LEVELS}
            />

            {/* Faculty: only meaningful once a level with a faculty step
                (+2, Diploma/PCL, Bachelor's, Master's) is chosen. */}
            <FilterSelect
              label="Faculty / Stream"
              value={filters.targetFaculty}
              onChange={(v) => setFilter("targetFaculty", v)}
              options={facultyOptions}
              placeholder={levelHasFaculty ? "All Faculties" : "Select a level first"}
              disabled={!levelHasFaculty}
              hint={
                filters.targetLevel && !levelHasFaculty
                  ? "This level has no faculty/stream."
                  : "Choose a Target Level first."
              }
            />

            {/* Program: only meaningful once a Faculty is chosen. */}
            <FilterSelect
              label="Degree / Program"
              value={filters.degreeProgram}
              onChange={(v) => setFilter("degreeProgram", v)}
              options={programOptions}
              placeholder={
                levelHasFaculty && filters.targetFaculty
                  ? "All Degrees / Programs"
                  : "Select a faculty first"
              }
              disabled={!levelHasFaculty || !filters.targetFaculty}
              hint="Choose a Faculty first."
            />

            <FilterGroupedSelect
              label="University / Affiliation"
              value={filters.university}
              onChange={(v) => setFilter("university", v)}
              groups={UNIVERSITY_GROUPS}
              placeholder="All Universities"
            />

            <FilterSelect
              label="College Type"
              value={filters.collegeType}
              onChange={(v) => setFilter("collegeType", v)}
              options={COLLEGE_TYPES}
              placeholder="All College Types"
            />

            <FilterSelect
              label="Gender"
              value={filters.gender}
              onChange={(v) => setFilter("gender", v)}
              options={GENDER_OPTIONS}
            />

            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(v) => setFilter("status", v)}
              options={[
                { value: "active", label: "Active only" },
                { value: "expired", label: "Expired" },
                { value: "all", label: "All" },
              ]}
            />

            {/* NPR Range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Amount (NPR)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilter("minAmount", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilter("maxAmount", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* Disability toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Disability Scholarship
              </label>
              <button
                onClick={() =>
                  setFilter("hasDisability", !filters.hasDisability)
                }
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  filters.hasDisability
                    ? "bg-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${filters.hasDisability ? "bg-white" : "border-gray-300"}`}
                >
                  {filters.hasDisability && (
                    <svg
                      className="w-2.5 h-2.5 text-black"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M10 3L5 8.5 2 5.5 1 6.5l4 4 6-7z" />
                    </svg>
                  )}
                </span>
                Disability inclusive
              </button>
            </div>
          </div>

          {/* Eligibility (self-reported) — helps surface scholarships the
              student actually qualifies for, mirroring the criteria
              institutions in Nepal commonly screen on. */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Check what you qualify for
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FilterSelect
                label="Your Category"
                value={filters.ethnicCategory}
                onChange={(v) => setFilter("ethnicCategory", v)}
                options={ETHNIC_CATEGORY_OPTIONS}
                placeholder="Prefer not to say"
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your GPA (0–4)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="e.g. 3.4"
                  value={filters.minGPA}
                  onChange={(e) => setFilter("minGPA", e.target.value)}
                  disabled={filters.minPercentage !== ""}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your Percentage
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 78"
                  value={filters.minPercentage}
                  onChange={(e) => setFilter("minPercentage", e.target.value)}
                  disabled={filters.minGPA !== ""}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your Age
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 20"
                  value={filters.studentAge}
                  onChange={(e) => setFilter("studentAge", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
          </div>

          {/* Location cascade */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <LocationCascade
              idMode="id"
              province={filters.provinceId}
              district={filters.districtId}
              municipality={filters.municipalityId}
              onChange={({ province, district, municipality }) =>
                setFilters((prev) => ({
                  ...prev,
                  provinceId: province,
                  districtId: district,
                  municipalityId: municipality,
                }))
              }
            />
          </div>

          {/* Panel actions */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
            <button
              onClick={clearAll}
              className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* ── Active filter chips ── */}
      <ActiveFilters
        filters={filters}
        labels={FILTER_LABELS}
        onRemove={removeFilter}
        onClearAll={clearAll}
      />

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-100 border-t-red-500 rounded-full" />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-semibold text-gray-500">No scholarships found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or check back later.
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="mt-4 text-red-500 text-sm font-medium underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Card Grid ── */}
      {!loading && !error && filtered.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <ScholarshipCard key={s._id} s={s} />
          ))}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && filtered.length > 0 && viewMode === "table" && (
        <ScholarshipTable scholarships={filtered} />
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            onClick={() => fetchScholarships(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchScholarships(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchScholarships(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}