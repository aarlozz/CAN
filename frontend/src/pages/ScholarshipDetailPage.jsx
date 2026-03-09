// ScholarshipDetailPage.jsx  —  /scholarships/:id
//
// Public page. Shows full scholarship details.
// Students: inline apply panel — applicationType selector + submit.
// Non-students / logged-out: "Log in to apply" CTA.
//
// API:
//   GET  /api/scholarships/:id
//   POST /api/applications   (student only)

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../Components/header';
import Footer from '../Components/footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Type compatibility map (mirrors backend logic) ─────────────────
// scholarshipType → which applicationTypes are valid
const VALID_APP_TYPES = {
  merit:       ['merit'],
  reservation: ['reservation'],
  both:        ['merit', 'reservation'],
};

const TYPE_LABELS = {
  merit:       'Merit',
  reservation: 'Reservation / Quota',
  both:        'Merit + Reservation',
};

const TYPE_BADGE = {
  merit:       'bg-blue-100 text-blue-700',
  reservation: 'bg-purple-100 text-purple-700',
  both:        'bg-indigo-100 text-indigo-700',
};

// ── Info row helper ───────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-lg flex-shrink-0 w-6">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

function ScholarshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userType } = useAuth();

  const [scholarship,    setScholarship]    = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  // Apply state
  const [applicationType, setApplicationType] = useState('');
  const [applying,        setApplying]        = useState(false);
  const [applyError,      setApplyError]      = useState('');
  const [applySuccess,    setApplySuccess]    = useState(false);

  // ── Fetch scholarship ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/scholarships/${id}`)
      .then(res => {
        if (!cancelled) {
          setScholarship(res.data.data);
          // Pre-select the only valid type if scholarship is merit or reservation
          const validTypes = VALID_APP_TYPES[res.data.data?.scholarshipType] ?? [];
          if (validTypes.length === 1) setApplicationType(validTypes[0]);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.response?.status === 404
            ? 'This scholarship was not found or is no longer active.'
            : 'Failed to load scholarship details.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // ── Submit application ────────────────────────────────────────
  const handleApply = async () => {
    setApplyError('');
    if (!applicationType) {
      setApplyError('Please select an application type.');
      return;
    }
    setApplying(true);
    try {
      await api.post('/applications', {
        scholarshipId:   id,
        applicationType,
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────
  const daysLeft     = scholarship ? Math.ceil((new Date(scholarship.applicationDeadline) - new Date()) / 86400000) : 0;
  const isExpired    = daysLeft <= 0;
  const validTypes   = VALID_APP_TYPES[scholarship?.scholarshipType] ?? [];
  const isStudent    = isLoggedIn && userType === 'student';

  // ─────────────────────────────────────────
  // RENDER — Loading
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 pb-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
            <div className="h-6 w-24 bg-gray-100 rounded-full mb-6" />
            <div className="h-8 bg-gray-100 rounded mb-3" />
            <div className="h-5 w-48 bg-gray-100 rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
              </div>
              <div className="h-64 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─────────────────────────────────────────
  // RENDER — Error / not found
  // ─────────────────────────────────────────
  if (error || !scholarship) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 pb-16 bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-5xl mb-4">🎓</p>
            <p className="font-semibold text-gray-900 text-xl mb-2">Scholarship not found</p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Link to="/scholarships" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Browse Scholarships
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─────────────────────────────────────────
  // RENDER — Main
  // ─────────────────────────────────────────
  const s = scholarship;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── Breadcrumb ─────────────────────────────────────── */}
          <nav className="py-6 text-sm text-gray-400">
            <Link to="/scholarships" className="hover:text-red-600 transition-colors">Scholarships</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700 line-clamp-1">{s.scholarshipTitle}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">

            {/* ── LEFT: Main content ────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Header card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                {/* Type badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 capitalize ${TYPE_BADGE[s.scholarshipType] ?? 'bg-gray-100 text-gray-600'}`}>
                  {TYPE_LABELS[s.scholarshipType] ?? s.scholarshipType}
                </span>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{s.scholarshipTitle}</h1>
                <p className="text-gray-500 text-sm mb-4">Offered by <span className="font-medium text-gray-700">{s.collegeName}</span></p>

                {s.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                )}
              </div>

              {/* Details card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Scholarship Details</h2>
                <InfoRow icon="💰" label="Amount"        value={s.financialDetails?.amount ? `NPR ${s.financialDetails.amount.toLocaleString()}` : null} />
                <InfoRow icon="🪑" label="Total Slots"   value={s.financialDetails?.totalSlots ? `${s.financialDetails.availableSlots ?? s.financialDetails.totalSlots} available of ${s.financialDetails.totalSlots}` : null} />
                <InfoRow icon="📅" label="Deadline"      value={new Date(s.applicationDeadline).toLocaleDateString('en-NP', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoRow icon="📍" label="Open To"       value={
                  s.locationFilter?.province?.provinceName
                    ? `${s.locationFilter.province.provinceName}${s.locationFilter.district?.districtName ? ` › ${s.locationFilter.district.districtName}` : ''}`
                    : 'All of Nepal'
                } />
                <InfoRow icon="📊" label="Applications"  value={s.statistics?.totalApplications > 0 ? `${s.statistics.totalApplications} submitted` : null} />
              </div>

              {/* Requirements card */}
              {(s.requirements?.eligibilityCriteria || s.requirements?.requiredDocuments?.length || s.requirements?.additionalRequirements) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Eligibility &amp; Requirements</h2>

                  {s.requirements.eligibilityCriteria && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Eligibility Criteria</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{s.requirements.eligibilityCriteria}</p>
                    </div>
                  )}

                  {s.requirements.requiredDocuments?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Required Documents</p>
                      <ul className="space-y-1">
                        {s.requirements.requiredDocuments.map((doc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {s.requirements.additionalRequirements && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Additional Requirements</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{s.requirements.additionalRequirements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: Apply panel (sticky) ───────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">

                {/* Deadline countdown */}
                <div className={`rounded-2xl border p-4 mb-4 text-center ${
                  isExpired
                    ? 'bg-gray-50 border-gray-200'
                    : daysLeft <= 7
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-3xl font-bold mb-0.5 ${isExpired ? 'text-gray-400' : daysLeft <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpired ? '—' : daysLeft}
                  </p>
                  <p className={`text-xs font-medium ${isExpired ? 'text-gray-400' : daysLeft <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpired ? 'Application closed' : `day${daysLeft === 1 ? '' : 's'} remaining`}
                  </p>
                </div>

                {/* Apply panel */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Apply for this Scholarship</h3>

                  {applySuccess ? (
                    /* Success state */
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Application Submitted!</p>
                      <p className="text-xs text-gray-500 mb-4">You can track its status in your dashboard.</p>
                      <Link
                        to="/dashboard/student"
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Go to My Dashboard →
                      </Link>
                    </div>
                  ) : isExpired ? (
                    /* Expired */
                    <p className="text-sm text-gray-500 text-center py-3">
                      The deadline for this scholarship has passed.
                    </p>
                  ) : !isLoggedIn ? (
                    /* Not logged in */
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-4">Log in as a student to apply.</p>
                      <Link
                        to={`/login`}
                        className="block w-full text-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                      >
                        Log in to Apply
                      </Link>
                      <p className="text-xs text-gray-400 mt-3">
                        New?{' '}
                        <Link to="/signup/student" className="text-red-600 hover:underline">Register as a student</Link>
                      </p>
                    </div>
                  ) : !isStudent ? (
                    /* Wrong role */
                    <p className="text-sm text-gray-500 text-center py-3">
                      Only students can apply for scholarships.
                    </p>
                  ) : (
                    /* Student apply form */
                    <>
                      {applyError && (
                        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                          {applyError}
                        </div>
                      )}

                      {/* Application type selector — only shown for "both" type */}
                      {validTypes.length > 1 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-600 mb-2">Application Type</p>
                          <div className="space-y-2">
                            {validTypes.map(t => (
                              <label key={t} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${applicationType === t ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}`}>
                                <input
                                  type="radio"
                                  name="applicationType"
                                  value={t}
                                  checked={applicationType === t}
                                  onChange={() => setApplicationType(t)}
                                  className="accent-red-600"
                                />
                                <span className="text-sm font-medium capitalize">{TYPE_LABELS[t]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Single type — just show it */}
                      {validTypes.length === 1 && (
                        <p className="text-xs text-gray-500 mb-4">
                          Application type: <span className="font-semibold text-gray-700 capitalize">{TYPE_LABELS[validTypes[0]]}</span>
                        </p>
                      )}

                      <button
                        onClick={handleApply}
                        disabled={applying || !applicationType}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {applying && (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {applying ? 'Submitting…' : 'Submit Application'}
                      </button>

                      <p className="text-xs text-gray-400 mt-3 text-center leading-relaxed">
                        Your profile information will be captured as a snapshot at the time of application.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ScholarshipDetailPage;