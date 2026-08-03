import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TYPE_COLORS = {
  School: "bg-blue-50 text-blue-700",
  College: "bg-green-50 text-green-700",
  University: "bg-purple-50 text-purple-700",
};

const COURSE_LEVELS = ["Undergraduate", "Graduate", "Postgraduate", "Diploma", "Certificate"];

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

function CheckboxRow({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 py-1.5 cursor-pointer group">
      <span className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-3.5 h-3.5 rounded border-gray-300 text-red-500 focus:ring-red-400 focus:ring-offset-0"
        />
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">{count}</span>
      )}
    </label>
  );
}

export default function InstitutionList() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]); // selected institutionType values
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [levels, setLevels] = useState([]); // selected course levels
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/instituionall/all-institution`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch institutions");
        return res.json();
      })
      .then((data) => {
        const list = data.institutions || (data.institution ? [data.institution] : []);
        setInstitutions(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Derive filter option lists from the actual data ──────────────────────
  const provinceOptions = useMemo(() => {
    const set = new Set(institutions.map((i) => i.location?.province).filter(Boolean));
    return [...set].sort();
  }, [institutions]);

  const districtOptions = useMemo(() => {
    const pool = province
      ? institutions.filter((i) => i.location?.province === province)
      : institutions;
    const set = new Set(pool.map((i) => i.location?.district).filter(Boolean));
    return [...set].sort();
  }, [institutions, province]);

  const typeCounts = useMemo(() => {
    const counts = {};
    institutions.forEach((i) => {
      if (i.institutionType) counts[i.institutionType] = (counts[i.institutionType] || 0) + 1;
    });
    return counts;
  }, [institutions]);

  // Reset district when province changes to something that no longer contains it
  useEffect(() => {
    if (district && !districtOptions.includes(district)) setDistrict("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province]);

  const toggleType = (t) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleLevel = (l) =>
    setLevels((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));

  const clearAll = () => {
    setSearch("");
    setTypes([]);
    setProvince("");
    setDistrict("");
    setLevels([]);
  };

  const activeFilterCount =
    types.length + levels.length + (province ? 1 : 0) + (district ? 1 : 0) + (search ? 1 : 0);

  const filtered = institutions.filter((inst) => {
    const matchSearch =
      !search ||
      inst.institutionName?.toLowerCase().includes(search.toLowerCase()) ||
      inst.location?.district?.toLowerCase().includes(search.toLowerCase());
    const matchType = types.length === 0 || types.includes(inst.institutionType);
    const matchProvince = !province || inst.location?.province === province;
    const matchDistrict = !district || inst.location?.district === district;
    const matchLevel =
      levels.length === 0 ||
      (inst.courses || []).some((c) => levels.includes(c.courseLevel));
    return matchSearch && matchType && matchProvince && matchDistrict && matchLevel;
  });

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

      <FilterSection title="Institution Type">
        {["School", "College", "University"].map((t) => (
          <CheckboxRow
            key={t}
            label={t}
            count={typeCounts[t]}
            checked={types.includes(t)}
            onChange={() => toggleType(t)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Province">
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        >
          <option value="">All Provinces</option>
          {provinceOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="District">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          disabled={districtOptions.length === 0}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">All Districts</option>
          {districtOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Course Level">
        {COURSE_LEVELS.map((l) => (
          <CheckboxRow
            key={l}
            label={l}
            checked={levels.includes(l)}
            onChange={() => toggleLevel(l)}
          />
        ))}
      </FilterSection>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Registered Institutions</h1>
        <p className="text-gray-500 mt-1">Browse institutions registered on the CAN portal</p>
      </div>

      {/* Search + mobile filter toggle */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or district…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
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
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
          {FilterPanel}
        </aside>

        {/* Mobile filter drawer */}
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
                Show {filtered.length} results
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && (
            <p className="text-sm text-gray-400 mb-4">
              Showing {filtered.length} of {institutions.length} institutions
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🏫</div>
              <p className="font-medium">No institutions found</p>
              <button
                onClick={clearAll}
                className="mt-3 text-sm text-red-500 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((inst) => (
              <Link
                key={inst._id}
                to={`/institutions/${inst._id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-red-100 transition-all"
              >
                {/* Cover placeholder — gradient banner using the institution's initials */}
                <div className="h-24 bg-gradient-to-br from-gray-900 to-gray-700 relative flex items-end px-5 pb-3">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-red-500/20 rounded-full blur-2xl" />
                  <span
                    className={`relative text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      TYPE_COLORS[inst.institutionType] || "bg-white/10 text-white"
                    }`}
                  >
                    {inst.institutionType}
                  </span>
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-gray-900 text-base leading-tight mb-1.5 group-hover:text-red-600 transition-colors">
                    {inst.institutionName}
                  </h4>

                  {inst.location?.district && (
                    <p className="text-sm text-gray-500 mb-3">
                      📍 {inst.location.district}
                      {inst.location.province ? `, ${inst.location.province}` : ""}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span>{(inst.courses || []).length} program{(inst.courses || []).length === 1 ? "" : "s"}</span>
                    {inst.establishedYear && <span>Est. {inst.establishedYear}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}