// StudentDashboard.jsx — Full student dashboard
//
// API calls:
//   GET /api/student/profile/completion  → { percentage, sections }
//   GET /api/applications/my             → paginated application list
//   GET /api/scholarships?deadline=upcoming&limit=4 → browse scholarships teaser
//
// Features:
//   • Profile completion progress bar with per-section checklist
//   • Application status cards with withdraw option (pending only)
//   • Available scholarships teaser (3–4 cards)
//   • Empty states for each section

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Status badge styles ───────────────────────────────────────────
const STATUS_STYLES = {
  pending:      'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-600',
  withdrawn:    'bg-gray-100 text-gray-500',
};

const STATUS_LABELS = {
  pending:      'Pending',
  under_review: 'Under Review',
  approved:     'Approved',
  rejected:     'Rejected',
  withdrawn:    'Withdrawn',
};

// ── Circular progress ring ────────────────────────────────────────
function ProgressRing({ pct }) {
  const r   = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={pct === 100 ? '#16a34a' : '#dc2626'}
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

function StudentDashboard() {
  const { user, profile: authProfile } = useAuth();

  const [completion,   setCompletion]   = useState(null);
  const [applications, setApplications] = useState([]);
  const [appPagination,setAppPagination]= useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [withdrawing,  setWithdrawing]  = useState(null); // id of app being withdrawn

  const fullName = authProfile?.fullName ?? user?.email ?? 'Student';

  // ── Fetch all data in parallel ───────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [compRes, appRes, scholRes] = await Promise.all([
        api.get('/student/profile/completion'),
        api.get('/applications/my?limit=5'),
        api.get('/scholarships?deadline=upcoming&limit=4'),
      ]);
      setCompletion(compRes.data.data);
      setApplications(appRes.data.data);
      setAppPagination(appRes.data.pagination);
      setScholarships(scholRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Withdraw an application ───────────────────────────────────
  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
    setWithdrawing(appId);
    try {
      await api.delete(`/applications/${appId}`);
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, applicationStatus: 'withdrawn' } : a)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Could not withdraw application.');
    } finally {
      setWithdrawing(null);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="py-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {fullName} 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          </div>

          {/* ── Error ────────────────────────────────────────── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between">
              {error}
              <button onClick={fetchData} className="underline ml-2">Retry</button>
            </div>
          )}

          {/* ── 2-column layout ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Profile completion ─────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Profile Completion</h2>

                {loading || !completion ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
                    <div className="w-32 h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    {/* Ring + percentage */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <ProgressRing pct={completion.percentage} />
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                          {completion.percentage}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {completion.completedCount}/{completion.totalSections} sections done
                        </p>
                        {!completion.isComplete && (
                          <Link
                            to="/profile/student"
                            className="text-xs text-red-600 hover:underline mt-0.5 inline-block"
                          >
                            Complete your profile →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Section checklist */}
                    <ul className="space-y-2">
                      {completion.sections.map(sec => (
                        <li key={sec.key} className="flex items-center gap-2.5 text-sm">
                          {sec.completed ? (
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                          <span className={sec.completed ? 'text-gray-600' : 'text-gray-400'}>
                            {sec.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* ── RIGHT: Applications ───────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">My Applications</h2>
                  {appPagination?.total > 0 && (
                    <span className="text-sm text-gray-400">{appPagination.total} total</span>
                  )}
                </div>

                {loading ? (
                  <div className="divide-y divide-gray-50">
                    {[1,2,3].map(i => (
                      <div key={i} className="px-6 py-4 flex items-center gap-4">
                        <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                        <div className="w-20 h-6 bg-gray-100 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="font-medium text-gray-900 mb-1">No applications yet</p>
                    <p className="text-sm text-gray-500 mb-4">Browse available scholarships and apply.</p>
                    <Link
                      to="/scholarships"
                      className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Browse Scholarships
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {applications.map(app => (
                      <li key={app._id} className="px-6 py-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {app.scholarshipId?.scholarshipTitle ?? 'Scholarship'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {app.scholarshipId?.collegeName ?? ''} ·{' '}
                            Applied {new Date(app.appliedAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.applicationStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABELS[app.applicationStatus] ?? app.applicationStatus}
                          </span>
                          {app.applicationStatus === 'pending' && (
                            <button
                              onClick={() => handleWithdraw(app._id)}
                              disabled={withdrawing === app._id}
                              className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Withdraw application"
                            >
                              {withdrawing === app._id ? '…' : 'Withdraw'}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* See all link */}
                {appPagination?.hasNext && (
                  <div className="px-6 py-3 border-t border-gray-100 text-center">
                    <Link to="/applications/my" className="text-sm text-red-600 hover:underline">
                      See all {appPagination.total} applications →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Available Scholarships teaser ─────────────────── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Available Scholarships</h2>
              <Link to="/scholarships" className="text-sm text-red-600 hover:underline">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse mb-4" />
                    <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : scholarships.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                No active scholarships at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scholarships.map(s => {
                  const daysLeft = Math.ceil((new Date(s.applicationDeadline) - new Date()) / 86400000);
                  return (
                    <div key={s._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                      <p className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{s.scholarshipTitle}</p>
                      <p className="text-xs text-gray-400 mb-1">{s.collegeName}</p>
                      <p className="text-xs text-gray-500 capitalize mb-3">{s.scholarshipType} scholarship</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className={`text-xs font-medium ${daysLeft <= 7 ? 'text-red-500' : 'text-gray-400'}`}>
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                        </span>
                        <Link
                          to={`/scholarships/${s._id}`}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

export default StudentDashboard;