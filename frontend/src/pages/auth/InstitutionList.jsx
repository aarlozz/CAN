import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TYPE_COLORS = {
  School: "bg-blue-50 text-blue-700",
  College: "bg-green-50 text-green-700",
  University: "bg-purple-50 text-purple-700",
};

export default function InstitutionList() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Correct backend route: GET /api/instituionall/all-institution (protected)
    fetch(`${API}/api/instituionall/all-institution`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch institutions");
        return res.json();
      })
      .then((data) => {
        // Backend returns { institution: {...} } (single) — adjust if returns array
        const list = data.institutions || (data.institution ? [data.institution] : []);
        setInstitutions(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const filtered = institutions.filter((inst) => {
    const matchSearch =
      !search ||
      inst.institutionName?.toLowerCase().includes(search.toLowerCase()) ||
      inst.location?.district?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || inst.institutionType === filterType;
    return matchSearch && matchType;
  });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Registered Institutions</h1>
          <p className="text-gray-500 mt-1">Browse institutions registered on the CAN portal</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name or district…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          >
            <option value="">All Types</option>
            <option>School</option>
            <option>College</option>
            <option>University</option>
          </select>
        </div>

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

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏫</div>
            <p className="font-medium">No institutions found</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst) => (
            <div
              key={inst._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-red-100 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-gray-900 text-lg leading-tight flex-1 mr-2">
                  {inst.institutionName}
                </h4>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    TYPE_COLORS[inst.institutionType] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {inst.institutionType}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-gray-500">
                {inst.location?.province && (
                  <p>📍 {inst.location.district}, {inst.location.province}</p>
                )}
                {inst.contactPerson?.phone && (
                  <p>📞 {inst.contactPerson.phone}</p>
                )}
                {inst.website && (
                  <a
                    href={inst.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-red-500 hover:underline truncate"
                  >
                    🌐 {inst.website}
                  </a>
                )}
              </div>

              {inst.isApproved !== undefined && (
                <div className="mt-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      inst.isApproved
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {inst.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}