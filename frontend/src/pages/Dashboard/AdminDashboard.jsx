// AdminDashboard.jsx — Full Admin & ProvincialAdmin dashboard
//
// API calls:
//   GET /api/admin/stats                  → { colleges, students, scholarships, applications, users }
//   GET /api/admin/colleges/pending       → paginated pending college queue
//   PUT /api/admin/colleges/:id/verify    → verify a college inline
//   PUT /api/admin/colleges/:id/reject    → reject with reason (inline input)
//
// Features:
//   • Scope badge (platform-wide vs province-scoped for PA)
//   • 6 live stat cards
//   • Pending colleges table — inline approve / reject
//   • Rejection reason input inline (no modal needed)
//   • Pagination for pending queue
//   • Polling-free: refresh button + auto-refresh after action

import { useState, useEffect, useCallback } from 'react';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? 'text-gray-900'}`}>
        {value === null ? (
          <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" />
        ) : value.toLocaleString()}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const { user, userType } = useAuth();
  const isPA = userType === 'provincial_admin';

  const [stats,           setStats]           = useState(null);
  const [colleges,        setColleges]         = useState([]);
  const [pagination,      setPagination]       = useState(null);
  const [page,            setPage]             = useState(1);
  const [loading,         setLoading]          = useState(true);
  const [statsLoading,    setStatsLoading]     = useState(true);
  const [error,           setError]            = useState('');

  // ── Per-row action states ────────────────────────────────────
  const [actionRow,     setActionRow]     = useState(null);  // id of row with reject input open
  const [rejectReason,  setRejectReason]  = useState('');
  const [submitting,    setSubmitting]    = useState(null);  // id being submitted

  // ── Fetch stats ──────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch { /* non-fatal */ }
    finally { setStatsLoading(false); }
  }, []);

  // ── Fetch pending colleges ───────────────────────────────────
  const fetchPending = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/colleges/pending?page=${p}&limit=10`);
      setColleges(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending colleges.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPending(page);
  }, [fetchStats, fetchPending, page]);

  // ── Verify a college ─────────────────────────────────────────
  const handleVerify = async (id) => {
    setSubmitting(id);
    try {
      await api.put(`/admin/colleges/${id}/verify`);
      setColleges(prev => prev.filter(c => c._id !== id));
      setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed.');
    } finally {
      setSubmitting(null);
    }
  };

  // ── Reject a college ─────────────────────────────────────────
  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason before submitting.');
      return;
    }
    setSubmitting(id);
    try {
      await api.put(`/admin/colleges/${id}/reject`, { rejectionReason: rejectReason.trim() });
      setColleges(prev => prev.filter(c => c._id !== id));
      setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
      setActionRow(null);
      setRejectReason('');
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setSubmitting(null);
    }
  };

  const openRejectRow = (id) => {
    setActionRow(id);
    setRejectReason('');
  };

  const cancelReject = () => {
    setActionRow(null);
    setRejectReason('');
  };

  // ── Derived stats ────────────────────────────────────────────
  const s = stats;
  const scope = s?.scope?.type === 'province' ? `Province: ${s.scope.provinceName}` : 'Platform-wide';

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isPA ? 'Provincial Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full">
                {scope}
              </span>
              <button
                onClick={() => { fetchStats(); fetchPending(page); }}
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* ── Error banner ─────────────────────────────────── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ── Stats grid ───────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard label="Pending"       value={statsLoading ? null : (s?.colleges?.pending  ?? 0)} accent="text-yellow-600" />
            <StatCard label="Verified"      value={statsLoading ? null : (s?.colleges?.verified ?? 0)} accent="text-green-600" />
            <StatCard label="Rejected"      value={statsLoading ? null : (s?.colleges?.rejected ?? 0)} accent="text-red-600" />
            <StatCard label="Scholarships"  value={statsLoading ? null : (s?.scholarships?.active ?? 0)} />
            <StatCard label="Applications"  value={statsLoading ? null : (
              (s?.applications?.pending ?? 0) +
              (s?.applications?.approved ?? 0) +
              (s?.applications?.rejected ?? 0)
            )} />
            {!isPA && (
              <StatCard label="Students"    value={statsLoading ? null : (s?.students?.total ?? 0)} />
            )}
          </div>

          {/* ── Pending Colleges queue ────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Pending College Verification</h2>
                <p className="text-xs text-gray-400 mt-0.5">Oldest requests shown first</p>
              </div>
              {pagination && (
                <span className="text-sm text-gray-400">{pagination.total} waiting</span>
              )}
            </div>

            {loading ? (
              <div className="divide-y divide-gray-50">
                {[1,2,3].map(i => (
                  <div key={i} className="px-6 py-5 flex items-center gap-4">
                    <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse" />
                    <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : colleges.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">No colleges pending verification.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {colleges.map(college => (
                  <div key={college._id}>
                    {/* Main row */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{college.collegeName}</p>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {college.location?.province?.provinceName && (
                            <span className="text-xs text-gray-400">
                              📍 {college.location.province.provinceName}
                              {college.location?.district?.districtName && ` › ${college.location.district.districtName}`}
                            </span>
                          )}
                          {college.contactInfo?.email && (
                            <span className="text-xs text-gray-400">✉ {college.contactInfo.email}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5">
                          Registered {new Date(college.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleVerify(college._id)}
                          disabled={submitting === college._id}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                        >
                          {submitting === college._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Verify
                        </button>

                        {actionRow === college._id ? (
                          <button
                            onClick={cancelReject}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => openRejectRow(college._id)}
                            disabled={submitting === college._id}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline rejection reason input — expands below the row */}
                    {actionRow === college._id && (
                      <div className="px-6 pb-4 bg-red-50 border-t border-red-100">
                        <p className="text-xs font-medium text-red-700 mt-3 mb-1.5">Rejection reason (required)</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReject(college._id)}
                            placeholder="e.g. Missing official registration documents"
                            className="flex-1 px-3 py-2 text-sm border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleReject(college._id)}
                            disabled={submitting === college._id || !rejectReason.trim()}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                          >
                            {submitting === college._id && (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <p className="text-gray-400">Page {pagination.page} of {pagination.pages}</p>
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
          </div>

          {/* ── Application breakdown ─────────────────────────── */}
          {s?.applications && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold text-sm">
                  {s.applications.pending}
                </div>
                <p className="text-sm text-gray-600">Pending applications</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm">
                  {s.applications.approved}
                </div>
                <p className="text-sm text-gray-600">Approved applications</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm">
                  {s.applications.rejected}
                </div>
                <p className="text-sm text-gray-600">Rejected applications</p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}

export default AdminDashboard;