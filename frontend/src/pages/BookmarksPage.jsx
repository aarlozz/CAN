// BookmarksPage.jsx — /bookmarks
//
// GET    /api/bookmarks              → list saved scholarships
// DELETE /api/bookmarks/:scholarshipId → remove a bookmark

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const formatNPR = (n) => `NPR ${Number(n).toLocaleString("en-NP")}`;

function deadlineInfo(d) {
  if (!d) return { label: "—", color: "text-gray-400" };
  const deadline = new Date(d);
  const now = new Date();
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Deadline passed", color: "text-red-500" };
  if (diff <= 7) return { label: `${diff}d left`, color: "text-orange-500" };
  return {
    label: deadline.toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" }),
    color: "text-gray-500",
  };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchBookmarks = () => {
    setLoading(true);
    setError("");
    api
      .get("/bookmarks")
      .then((res) => setBookmarks(res.data.bookmarks || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load your bookmarks.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (scholarshipId) => {
    setRemovingId(scholarshipId);
    try {
      await api.delete(`/bookmarks/${scholarshipId}`);
      setBookmarks((prev) => prev.filter((b) => b.scholarship?._id !== scholarshipId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove bookmark.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-10 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Scholarships you've saved for later.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-red-100 border-t-red-500 rounded-full" />
          </div>
        )}

        {!loading && !error && bookmarks.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🔖</div>
            <p className="font-semibold text-gray-500">No bookmarks yet</p>
            <p className="text-sm mt-1">
              Save scholarships you're interested in and they'll show up here.
            </p>
            <Link
              to="/scholarships"
              className="inline-block mt-4 text-red-500 text-sm font-medium underline"
            >
              Browse scholarships
            </Link>
          </div>
        )}

        {!loading && !error && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map(({ bookmarkId, scholarship: s }) => {
              const dl = deadlineInfo(s.applicationDeadline);
              return (
                <div
                  key={bookmarkId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-red-100 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">
                      {s.scholarshipTitle}
                    </h3>
                    <button
                      onClick={() => handleRemove(s._id)}
                      disabled={removingId === s._id}
                      title="Remove bookmark"
                      className="shrink-0 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 mb-3">
                    🏫 {s.institutionName}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs">
                    <span className={`font-medium ${dl.color}`}>📅 {dl.label}</span>
                    {s.coverage?.amountNpr > 0 && (
                      <span className="text-gray-600 font-semibold">
                        💰 {formatNPR(s.coverage.amountNpr)}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/scholarships/${s._id}`}
                    className="block text-center bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-xl transition-colors mt-4"
                  >
                    View Details →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}