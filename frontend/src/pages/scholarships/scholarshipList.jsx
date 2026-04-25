import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

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

const TARGET_LEVELS = [
  { value: "plus_two", label: "+2 / PCL" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "mphil", label: "M.Phil" },
  { value: "phd", label: "PhD" },
  { value: "diploma", label: "Diploma" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "any", label: "Any" },
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

const LEVEL_LABEL = {
  plus_two: "+2/PCL",
  bachelor: "Bachelor",
  master: "Master",
  mphil: "M.Phil",
  phd: "PhD",
  diploma: "Diploma",
};

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
}) {
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
          {s.coverage?.amountNpr > 0 && (
            <span className="text-gray-600 font-semibold">
              💰 {formatNPR(s.coverage.amountNpr)}
            </span>
          )}
        </div>
        {s.remainingSeats != null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-red-400 h-full rounded-full"
                style={{
                  width: `${Math.round(((s.totalSeats - s.remainingSeats) / s.totalSeats) * 100)}%`,
                }}
              />
            </div>
            <span className="shrink-0">
              {s.remainingSeats} / {s.totalSeats} seats left
            </span>
          </div>
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
  scholarshipType: "Type",
  targetLevel: "Level",
  targetFaculty: "Faculty",
  subject: "Subject",
  gender: "Gender",
  hasDisability: "Disability",
  provinceId: "Province",
  districtId: "District",
  municipalityId: "Municipality",
  status: "Status",
  minAmount: "Min Amount",
  maxAmount: "Max Amount",
};

const DEFAULT_FILTERS = {
  scholarshipType: "",
  targetLevel: "",
  targetFaculty: "",
  subject: "",
  gender: "",
  hasDisability: false,
  provinceId: "",
  districtId: "",
  municipalityId: "",
  status: "active",
  minAmount: "",
  maxAmount: "",
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

  // Location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  // Panel toggle
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Search (frontend only)
  const [search, setSearch] = useState("");

  // Filters (backend)
  const [filters, setFilters] = useState(() => {
    const f = { ...DEFAULT_FILTERS };
    for (const key of Object.keys(DEFAULT_FILTERS)) {
      const v = searchParams.get(key);
      if (v !== null) f[key] = key === "hasDisability" ? v === "true" : v;
    }
    return f;
  });

  // ── Sync filters → URL ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v !== "" && v !== false && v !== null) params[k] = String(v);
    }
    setSearchParams(params, { replace: true });
  }, [filters]);

  // ── Fetch provinces on mount ────────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API}/api/location/provinces`)
      .then((r) => setProvinces(r.data.provinces || []))
      .catch(() => {});
  }, []);

  // ── Fetch districts when province changes ───────────────────────────────────
  useEffect(() => {
    if (!filters.provinceId) {
      setDistricts([]);
      setMunicipalities([]);
      return;
    }
    axios
      .get(`${API}/api/location/districts?provinceId=${filters.provinceId}`)
      .then((r) => setDistricts(r.data.districts || []))
      .catch(() => {});
  }, [filters.provinceId]);

  // ── Fetch municipalities when district changes ──────────────────────────────
  useEffect(() => {
    if (!filters.districtId) {
      setMunicipalities([]);
      return;
    }
    axios
      .get(
        `${API}/api/location/municipalities?districtId=${filters.districtId}`,
      )
      .then((r) => setMunicipalities(r.data.municipalities || []))
      .catch(() => {});
  }, [filters.districtId]);

  // ── Fetch scholarships ──────────────────────────────────────────────────────
  const fetchScholarships = useCallback(
    (p = 1) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: p, limit: 12 });

      const MAP = {
        scholarshipType: "scholarshipType",
        targetLevel: "targetLevel",
        targetFaculty: "targetFaculty",
        subject: "subject",
        gender: "gender",
        hasDisability: "hasDisability",
        provinceId: "provinceId",
        districtId: "districtId",
        municipalityId: "municipalityId",
        status: "status",
        minAmount: "minAmount",
        maxAmount: "maxAmount",
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

  const removeFilter = (key) => setFilter(key, DEFAULT_FILTERS[key]);

  const clearAll = () => setFilters({ ...DEFAULT_FILTERS });

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v !== "" && v !== false && v !== null,
  ).length;

  // ── Frontend search ─────────────────────────────────────────────────────────
  const filtered = search.trim()
    ? scholarships.filter(
        (s) =>
          s.scholarshipTitle?.toLowerCase().includes(search.toLowerCase()) ||
          s.institutionName?.toLowerCase().includes(search.toLowerCase()),
      )
    : scholarships;

  // ── View mode toggle ────────────────────────────────────────────────────────
  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem("schViewMode", mode);
  };

  return (
    <>
      <Header />
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
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by title or institution…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
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

              <FilterInput
                label="Faculty"
                value={filters.targetFaculty}
                onChange={(v) => setFilter("targetFaculty", v)}
                placeholder="e.g. Engineering, Law…"
              />

              <FilterInput
                label="Subject"
                value={filters.subject}
                onChange={(v) => setFilter("subject", v)}
                placeholder="e.g. Computer Science…"
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
                      ? "bg-purple-50 border-purple-300 text-purple-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${filters.hasDisability ? "bg-purple-500 border-purple-500" : "border-gray-300"}`}
                  >
                    {filters.hasDisability && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
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

            {/* Location cascade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <FilterSelect
                label="Province"
                value={filters.provinceId}
                onChange={(v) => setFilter("provinceId", v)}
                options={provinces.map((p) => ({
                  value: p._id,
                  label: p.name || p.provinceName,
                }))}
                placeholder="All Provinces"
              />
              <FilterSelect
                label="District"
                value={filters.districtId}
                onChange={(v) => setFilter("districtId", v)}
                options={districts.map((d) => ({
                  value: d._id,
                  label: d.name || d.districtName,
                }))}
                placeholder={
                  filters.provinceId ? "All Districts" : "Select Province first"
                }
              />
              <FilterSelect
                label="Municipality"
                value={filters.municipalityId}
                onChange={(v) => setFilter("municipalityId", v)}
                options={municipalities.map((m) => ({
                  value: m._id,
                  label: m.name || m.municipalityName,
                }))}
                placeholder={
                  filters.districtId
                    ? "All Municipalities"
                    : "Select District first"
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
      <Footer />
    </>
  );
}
