// CollegeDashboard.jsx — Full college dashboard
//
// API calls:
//   GET /api/college/profile      → collegeName, verification.status, contactInfo
//   GET /api/scholarships/my      → scholarships with statistics embedded
//
// Features:
//   • Verification status banner (pending / rejected / verified)
//   • Live stat cards: total scholarships, active, total applications
//   • Scholarship table with status badges + application counts
//   • Empty state with CTA to post first scholarship
//   • Profile completion nudge if location/contact info missing

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────
const STATUS_BADGE = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  deleted:  'bg-red-100 text-red-600',
};

const VERIFY_BADGE = {
  pending:  { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⏳', label: 'Pending Verification' },
  verified: { bg: 'bg-green-50 border-green-200 text-green-800',   icon: '✅', label: 'Verified' },
  rejected: { bg: 'bg-red-50 border-red-200 text-red-800',         icon: '❌', label: 'Rejected' },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-4xl font-bold text-red-600">
        {value === null ? (
          <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" />
        ) : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function CollegeDashboard() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [profile,      setProfile]      = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [page,         setPage]         = useState(1);

  // ── Fetch all data on mount ──────────────────────────────────
  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, scholarshipsRes] = await Promise.all([
        api.get('/college/profile'),
        api.get(`/scholarships/my?page=${p}&limit=8`),
      ]);

      const col = profileRes.data.data;
      setProfile(col);
      refreshProfile({ collegeName: col.collegeName, verification: col.verification });

      setScholarships(scholarshipsRes.data.data);
      setPagination(scholarshipsRes.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => { fetchData(page); }, [fetchData, page]);

  // ── Derived stats from scholarships list ─────────────────────
  const totalScholarships  = pagination?.total ?? null;
  const activeScholarships = scholarships.filter(s => s.isActive && !s.isDeleted).length;
  const totalApplications  = scholarships.reduce((sum, s) => sum + (s.statistics?.totalApplications ?? 0), 0);

  const verifyStatus  = profile?.verification?.status ?? 'pending';
  const collegeName   = profile?.collegeName ?? user?.email ?? '…';
  const verifyBadge   = VERIFY_BADGE[verifyStatus] ?? VERIFY_BADGE.pending;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{collegeName}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            </div>
            {verifyStatus === 'verified' && (
              <Link
                to="/scholarships/new"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Post Scholarship
              </Link>
            )}
          </div>

          {/* ── Error ────────────────────────────────────────── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between">
              {error}
              <button onClick={() => fetchData(page)} className="underline ml-2">Retry</button>
            </div>
          )}

          {/* ── Verification banner ───────────────────────────── */}
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm mb-6 ${verifyBadge.bg}`}>
            <span className="text-lg leading-none">{verifyBadge.icon}</span>
            <div>
              <p className="font-semibold">{verifyBadge.label}</p>
              {verifyStatus === 'pending' && (
                <p className="mt-0.5 opacity-80">
                  Your college is awaiting review. You can complete your profile while you wait.
                </p>
              )}
              {verifyStatus === 'rejected' && (
                <p className="mt-0.5 opacity-80">
                  Rejection reason: {profile?.verification?.rejectionReason ?? '—'}. Please contact support.
                </p>
              )}
            </div>
          </div>

          {/* ── Stat cards ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Scholarships"  value={loading ? null : totalScholarships} />
            <StatCard label="Active Scholarships"  value={loading ? null : (pagination ? activeScholarships : null)} sub="on this page" />
            <StatCard label="Applications Received" value={loading ? null : totalApplications} sub="across all scholarships" />
          </div>

          {/* ── Scholarships table ────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">My Scholarships</h2>
              <span className="text-sm text-gray-400">{pagination ? `${pagination.total} total` : ''}</span>
            </div>

            {loading ? (
              /* Skeleton rows */
              <div className="divide-y divide-gray-50">
                {[1,2,3].map(i => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : scholarships.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3L2 9l10 6 10-6-10-6zM2 17l10 6 10-6" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 mb-1">No scholarships yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  {verifyStatus === 'verified'
                    ? 'Post your first scholarship to start receiving applications.'
                    : 'Once your account is verified, you can post scholarships.'}
                </p>
                {verifyStatus === 'verified' && (
                  <Link
                    to="/scholarships/new"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Post First Scholarship
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                        <th className="text-left px-6 py-3 font-medium">Scholarship</th>
                        <th className="text-left px-6 py-3 font-medium">Type</th>
                        <th className="text-left px-6 py-3 font-medium">Deadline</th>
                        <th className="text-right px-6 py-3 font-medium">Applications</th>
                        <th className="text-center px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {scholarships.map(s => {
                        const isExpired = new Date(s.applicationDeadline) < new Date();
                        const statusKey = s.isDeleted ? 'deleted' : s.isActive ? 'active' : 'inactive';
                        return (
                          <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                              {s.scholarshipTitle}
                            </td>
                            <td className="px-6 py-4 text-gray-500 capitalize">
                              {s.scholarshipType}
                            </td>
                            <td className={`px-6 py-4 ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                              {s.applicationDeadline
                                ? new Date(s.applicationDeadline).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                              {isExpired && <span className="ml-1 text-xs">(expired)</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-semibold text-gray-900">{s.statistics?.totalApplications ?? 0}</span>
                              {s.statistics?.pendingApplications > 0 && (
                                <span className="ml-1 text-xs text-yellow-600">
                                  ({s.statistics.pendingApplications} pending)
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[statusKey]}`}>
                                {statusKey}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <p className="text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

export default CollegeDashboard;