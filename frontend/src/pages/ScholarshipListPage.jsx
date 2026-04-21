// ScholarshipListPage.jsx  —  /scholarships
//
// Public page — no auth required.
// Students see an "Apply" link on each card.
// Supports: text search, type filter, province filter, upcoming-only toggle,
//           grid/table view toggle, pagination.
//
// API:  GET /api/scholarships
//       Query params: search, type, province, deadline=upcoming, page, limit

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../Components/header';
import Footer from '../Components/footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────
const SCHOLARSHIP_TYPES = [
  { value: '',            label: 'All Types' },
  { value: 'merit',       label: 'Merit' },
  { value: 'reservation', label: 'Reservation' },
  { value: 'both',        label: 'Merit + Reservation' },
];

const TYPE_BADGE = {
  merit:       'bg-blue-100 text-blue-700',
  reservation: 'bg-purple-100 text-purple-700',
  both:        'bg-indigo-100 text-indigo-700',
};

// ── Inline ViewToggle ─────────────────────────────────────────────
function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onToggle('table')}
        title="Table view"
        className={`p-1.5 rounded-md transition-colors ${
          viewMode === 'table'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <button
        onClick={() => onToggle('grid')}
        title="Grid view"
        className={`p-1.5 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        active
          ? 'bg-red-600 text-white border-red-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
      }`}
    >
      {children}
    </button>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="h-4 w-20 bg-gray-100 rounded-full mb-3" />
      <div className="h-5 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
      <div className="flex gap-4 mb-4">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
      <div className="h-9 bg-gray-100 rounded-xl" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-50">
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-3/4 mb-1" /><div className="h-3 bg-gray-100 rounded w-1/2" /></td>
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
      <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-28" /></td>
      <td className="px-5 py-4"><div className="h-8 bg-gray-100 rounded-lg w-24" /></td>
    </tr>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="py-24 text-center">
      <p className="text-4xl mb-4">🎓</p>
      <p className="font-semibold text-gray-900 mb-1">No scholarships found</p>
      <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
      <button onClick={onClear} className="mt-4 text-sm text-red-600 hover:underline">
        Clear all filters
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
function ScholarshipListPage() {
  const { isLoggedIn, userType } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [search,       setSearch]       = useState(searchParams.get('search') || '');
  const [type,         setType]         = useState(searchParams.get('type')   || '');
  const [province,     setProvince]     = useState(searchParams.get('province') || '');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('deadline') === 'upcoming');
  const [page,         setPage]         = useState(Number(searchParams.get('page')) || 1);

  // View mode — 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Data state
  const [scholarships, setScholarships] = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [provinces,    setProvinces]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const searchTimer = useRef(null);

  useEffect(() => {
    api.get('/locations/provinces')
      .then(r => setProvinces(r.data.data || []))
      .catch(() => {});
  }, []);

  const fetchScholarships = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search)       params.set('search',   search);
      if (type)         params.set('type',      type);
      if (province)     params.set('province',  province);
      if (upcomingOnly) params.set('deadline',  'upcoming');
      params.set('page',  String(p));
      params.set('limit', '12');

      const res = await api.get(`/scholarships?${params}`);
      setScholarships(res.data.data);
      setPagination(res.data.pagination);
      setSearchParams(Object.fromEntries(params), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load scholarships.');
    } finally {
      setLoading(false);
    }
  }, [search, type, province, upcomingOnly, setSearchParams]);

  useEffect(() => {
    setPage(1);
    fetchScholarships(1);
  }, [type, province, upcomingOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchScholarships(1); }, 400);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchScholarships(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const daysLeft     = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
  const formatAmt    = (details) => details?.amount ? `NPR ${details.amount.toLocaleString()}` : null;
  const clearFilters = () => { setSearch(''); setType(''); setProvince(''); setUpcomingOnly(false); };

  // Pagination bar
  const PaginationBar = () =>
    pagination && pagination.pages > 1 ? (
      <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
        <button onClick={() => handlePageChange(page - 1)} disabled={!pagination.hasPrev}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          ← Prev
        </button>
        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
          .filter(n => n === 1 || n === pagination.pages || Math.abs(n - page) <= 1)
          .reduce((acc, n, idx, arr) => {
            if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
            acc.push(n);
            return acc;
          }, [])
          .map((n, i) =>
            n === '…'
              ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
              : <button key={n} onClick={() => handlePageChange(n)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${n === page ? 'bg-red-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {n}
                </button>
          )}
        <button onClick={() => handlePageChange(page + 1)} disabled={!pagination.hasNext}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next →
        </button>
      </div>
    ) : null;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Page header */}
          <div className="py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Available Scholarships
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Browse verified scholarships from institutions across Nepal
            </p>
          </div>

          {/* Search + type dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by title or institution..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
            <select
              value={type}
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              {SCHOLARSHIP_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Secondary filters + VIEW TOGGLE */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <FilterPill active={upcomingOnly} onClick={() => setUpcomingOnly(v => !v)}>
              ⏰ Deadline upcoming
            </FilterPill>
            <select
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Provinces</option>
              {provinces.map(p => (
                <option key={p._id} value={p._id}>{p.provinceName}</option>
              ))}
            </select>

            {/* spacer pushes toggle to right */}
            <div className="flex-1" />

            {/* VIEW TOGGLE — always rendered */}
            <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
          </div>

          {/* Results count */}
          {!loading && pagination && (
            <p className="text-sm text-gray-400 mb-4">
              {pagination.total === 0
                ? 'No scholarships match your filters'
                : `${pagination.total} scholarship${pagination.total === 1 ? '' : 's'} found`}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 text-red-600 text-sm">
              {error} — <button onClick={() => fetchScholarships(page)} className="underline">retry</button>
            </div>
          )}

          {/* ── GRID VIEW ─────────────────────────────────────── */}
          {viewMode === 'grid' && (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : scholarships.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scholarships.map(s => {
                  const dl    = daysLeft(s.applicationDeadline);
                  const amt   = formatAmt(s.financialDetails);
                  const slots = s.financialDetails?.totalSlots;
                  const avail = s.financialDetails?.availableSlots;
                  return (
                    <div key={s._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE[s.scholarshipType] ?? 'bg-gray-100 text-gray-600'}`}>
                          {s.scholarshipType}
                        </span>
                        <span className={`text-xs font-medium ${dl <= 7 && dl > 0 ? 'text-red-500' : dl <= 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                          {dl > 0 ? `${dl}d left` : 'Expired'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{s.scholarshipTitle}</h3>
                      <p className="text-xs text-gray-400 mb-3 truncate">{s.collegeName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
                        {amt && <span className="text-green-600 font-semibold">{amt}</span>}
                        {slots && <span>{avail ?? slots}/{slots} slots</span>}
                        {s.locationFilter?.province?.provinceName && (
                          <span className="truncate">📍 {s.locationFilter.province.provinceName}</span>
                        )}
                      </div>
                      {s.statistics?.totalApplications > 0 && (
                        <p className="text-xs text-gray-400 mb-3">
                          {s.statistics.totalApplications} application{s.statistics.totalApplications === 1 ? '' : 's'}
                        </p>
                      )}
                      <div className="mt-auto flex gap-2">
                        <Link to={`/scholarships/${s._id}`}
                          className="flex-1 text-center py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                          View Details →
                        </Link>
                        {isLoggedIn && userType === 'student' && dl > 0 && (
                          <Link to={`/scholarships/${s._id}`}
                            className="flex-1 text-center py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors">
                            Apply
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── TABLE VIEW ────────────────────────────────────── */}
          {viewMode === 'table' && (
            loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Scholarship', 'Institution', 'Type', 'Amount / Slots', 'Deadline', 'Action'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
                </table>
              </div>
            ) : scholarships.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Scholarship</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Institution</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount / Slots</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {scholarships.map(s => {
                        const dl    = daysLeft(s.applicationDeadline);
                        const amt   = formatAmt(s.financialDetails);
                        const slots = s.financialDetails?.totalSlots;
                        const avail = s.financialDetails?.availableSlots;
                        return (
                          <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-900 max-w-xs">{s.scholarshipTitle}</p>
                              {s.locationFilter?.province?.provinceName && (
                                <p className="text-xs text-gray-400 mt-0.5">📍 {s.locationFilter.province.provinceName}</p>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-500 max-w-[160px]">
                              <p className="truncate">{s.collegeName}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE[s.scholarshipType] ?? 'bg-gray-100 text-gray-600'}`}>
                                {s.scholarshipType}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {amt
                                ? <span className="text-green-600 font-semibold text-sm">{amt}</span>
                                : <span className="text-gray-300">—</span>}
                              {slots && <p className="text-xs text-gray-400 mt-0.5">{avail ?? slots}/{slots} slots</p>}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-sm font-medium ${dl <= 0 ? 'text-gray-300' : dl <= 7 ? 'text-red-500' : 'text-gray-700'}`}>
                                {new Date(s.applicationDeadline).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5">{dl > 0 ? `${dl}d left` : 'Expired'}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2 items-center">
                                <Link to={`/scholarships/${s._id}`}
                                  className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                                  View Details →
                                </Link>
                                {isLoggedIn && userType === 'student' && dl > 0 && (
                                  <Link to={`/scholarships/${s._id}`}
                                    className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                                    Apply
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Pagination */}
          <PaginationBar />

        </div>
      </main>
      <Footer />
    </>
  );
}

export default ScholarshipListPage;