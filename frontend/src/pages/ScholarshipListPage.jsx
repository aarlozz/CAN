// ScholarshipListPage.jsx  —  /scholarships
//
// Public page — no auth required.
// Students see an "Apply" link on each card.
// Supports: text search, type filter, province filter, upcoming-only toggle, pagination.
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

// ── Small reusable components ─────────────────────────────────────
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

function ScholarshipListPage() {
  const { isLoggedIn, userType } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state — initialised from URL query params ─────────
  const [search,       setSearch]       = useState(searchParams.get('search') || '');
  const [type,         setType]         = useState(searchParams.get('type')   || '');
  const [province,     setProvince]     = useState(searchParams.get('province') || '');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('deadline') === 'upcoming');
  const [page,         setPage]         = useState(Number(searchParams.get('page')) || 1);

  // ── Data state ────────────────────────────────────────────────
  const [scholarships, setScholarships] = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [provinces,    setProvinces]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Debounce search input
  const searchTimer = useRef(null);

  // ── Load provinces once ───────────────────────────────────────
  useEffect(() => {
    api.get('/locations/provinces')
      .then(r => setProvinces(r.data.data || []))
      .catch(() => {});
  }, []);

  // ── Fetch scholarships ────────────────────────────────────────
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

      // Mirror filters into URL for shareability
      setSearchParams(Object.fromEntries(params), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load scholarships.');
    } finally {
      setLoading(false);
    }
  }, [search, type, province, upcomingOnly, setSearchParams]);

  // Re-fetch whenever filters change (reset to page 1)
  useEffect(() => {
    setPage(1);
    fetchScholarships(1);
  }, [type, province, upcomingOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search input is debounced 400 ms
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchScholarships(1);
    }, 400);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchScholarships(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Helpers ───────────────────────────────────────────────────
  const daysLeft = (deadline) =>
    Math.ceil((new Date(deadline) - new Date()) / 86400000);

  const formatAmount = (details) => {
    if (!details?.amount) return null;
    return `NPR ${details.amount.toLocaleString()}`;
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── Hero header ────────────────────────────────────── */}
          <div className="py-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Find Your Scholarship
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Browse scholarships posted by verified colleges across Nepal.
            </p>
          </div>

          {/* ── Search bar ─────────────────────────────────────── */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search scholarships…"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* ── Filters row ────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 mb-6 justify-center">
            {/* Type pills */}
            {SCHOLARSHIP_TYPES.map(t => (
              <FilterPill key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
                {t.label}
              </FilterPill>
            ))}

            {/* Divider */}
            <span className="hidden sm:inline text-gray-200 select-none">|</span>

            {/* Upcoming only toggle */}
            <FilterPill active={upcomingOnly} onClick={() => setUpcomingOnly(v => !v)}>
              ⏰ Deadline upcoming
            </FilterPill>

            {/* Province filter */}
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
          </div>

          {/* ── Results header ─────────────────────────────────── */}
          {!loading && pagination && (
            <p className="text-sm text-gray-400 mb-4 text-center">
              {pagination.total === 0
                ? 'No scholarships match your filters'
                : `${pagination.total} scholarship${pagination.total === 1 ? '' : 's'} found`}
            </p>
          )}

          {/* ── Error ──────────────────────────────────────────── */}
          {error && (
            <div className="mb-6 text-center text-red-600 text-sm">
              {error} —{' '}
              <button onClick={() => fetchScholarships(page)} className="underline">retry</button>
            </div>
          )}

          {/* ── Card grid ──────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-4xl mb-4">🎓</p>
              <p className="font-semibold text-gray-900 mb-1">No scholarships found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
              <button
                onClick={() => { setSearch(''); setType(''); setProvince(''); setUpcomingOnly(false); }}
                className="mt-4 text-sm text-red-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {scholarships.map(s => {
                const dl    = daysLeft(s.applicationDeadline);
                const amt   = formatAmount(s.financialDetails);
                const slots = s.financialDetails?.totalSlots;
                const avail = s.financialDetails?.availableSlots;

                return (
                  <div
                    key={s._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6"
                  >
                    {/* Type badge + days left */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE[s.scholarshipType] ?? 'bg-gray-100 text-gray-600'}`}>
                        {s.scholarshipType}
                      </span>
                      <span className={`text-xs font-medium ${dl <= 7 && dl > 0 ? 'text-red-500' : dl <= 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                        {dl > 0 ? `${dl}d left` : 'Expired'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                      {s.scholarshipTitle}
                    </h3>

                    {/* College name */}
                    <p className="text-xs text-gray-400 mb-3 truncate">{s.collegeName}</p>

                    {/* Amount + slots */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      {amt && (
                        <span className="flex items-center gap-1">
                          <span className="text-green-600 font-semibold">{amt}</span>
                        </span>
                      )}
                      {slots && (
                        <span>
                          {avail ?? slots}/{slots} slots
                        </span>
                      )}
                      {s.locationFilter?.province?.provinceName && (
                        <span className="truncate">📍 {s.locationFilter.province.provinceName}</span>
                      )}
                    </div>

                    {/* Applications count */}
                    {s.statistics?.totalApplications > 0 && (
                      <p className="text-xs text-gray-400 mb-3">
                        {s.statistics.totalApplications} application{s.statistics.totalApplications === 1 ? '' : 's'}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-auto flex gap-2">
                      <Link
                        to={`/scholarships/${s._id}`}
                        className="flex-1 text-center py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Details
                      </Link>
                      {isLoggedIn && userType === 'student' && dl > 0 && (
                        <Link
                          to={`/scholarships/${s._id}`}
                          className="flex-1 text-center py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          Apply
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ─────────────────────────────────────── */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {/* Page number pills */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === pagination.pages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => handlePageChange(n)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        n === page
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}

export default ScholarshipListPage;