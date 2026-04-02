import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

// FIXES IN THIS FILE:
// The entire file was wrong — it was a copy of a detail page.
// It used useParams() to get an :id, fetched ONE scholarship by ID,
// used a <Section> component that was never defined (crash on render),
// and had no list/search/filter logic at all.
// Replaced entirely with the correct list page.

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TYPE_COLORS = {
  merit:       "bg-blue-50 text-blue-700",
  reservation: "bg-purple-50 text-purple-700",
  both:        "bg-green-50 text-green-700",
};

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);

  const fetchScholarships = (p = 1, type = filterType) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: p, limit: 12 });
    if (type) params.set("scholarshipType", type);

    // FIX: correct API path is /api/scholarship/all (singular)
    // The old broken file had /api/scholarships/${id} — wrong plural + wrong route
    axios
      .get(`${API}/api/scholarship/all?${params}`)
      .then((res) => {
        setScholarships(res.data.scholarships || []);
        setTotalPages(res.data.pages || 1);
        setPage(p);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load scholarships.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScholarships(1, filterType);
  }, [filterType]);

  // Client-side search on already-fetched page
  const filtered = search.trim()
    ? scholarships.filter(
        (s) =>
          s.scholarshipTitle?.toLowerCase().includes(search.toLowerCase()) ||
          s.institutionName?.toLowerCase().includes(search.toLowerCase())
      )
    : scholarships;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Available Scholarships
          </h1>
          <p className="text-gray-500 mt-1">
            Browse verified scholarships from institutions across Nepal
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by title or institution…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="merit">Merit</option>
            <option value="reservation">Reservation</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🎓</div>
            <p className="font-medium">No scholarships found</p>
            <p className="text-sm mt-1">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => {
              const isExpired = new Date(s.applicationDeadline) < new Date();
              return (
                <div
                  key={s._id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md hover:border-red-100 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-base leading-tight flex-1 mr-2">
                      {s.scholarshipTitle}
                    </h4>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                        TYPE_COLORS[s.scholarshipType] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.scholarshipType}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-1 font-medium">
                    {s.institutionName}
                  </p>

                  {s.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {s.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 space-y-1 mb-4 mt-auto">
                    <p>
                      📅{" "}
                      {isExpired ? (
                        <span className="text-red-400">
                          Deadline passed (
                          {new Date(s.applicationDeadline).toLocaleDateString()})
                        </span>
                      ) : (
                        new Date(s.applicationDeadline).toLocaleDateString()
                      )}
                    </p>
                    {s.financialDetails?.amount > 0 && (
                      <p>💰 NPR {s.financialDetails.amount.toLocaleString()}</p>
                    )}
                    {s.financialDetails?.totalSlots > 0 && (
                      <p>🪑 {s.financialDetails.availableSlots} slots left</p>
                    )}
                  </div>

                  <Link
                    to={`/scholarships/${s._id}`}
                    className="block text-center bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchScholarships(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-red-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}