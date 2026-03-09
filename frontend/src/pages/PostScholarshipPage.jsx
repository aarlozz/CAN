// PostScholarshipPage.jsx  —  /scholarships/new
//
// Protected (college only). Verified colleges only — unverified get a locked state.
// Creates a new scholarship via POST /api/scholarships.
//
// Fields:
//   Required: scholarshipTitle, scholarshipType, applicationDeadline
//   Optional: description, financialDetails (amount, totalSlots),
//             requirements (eligibilityCriteria, requiredDocuments[], additionalRequirements),
//             locationFilter (province → district cascade)
//
// On success: navigate to /dashboard/college with a flash param.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/header';
import Footer from '../Components/footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────
const inputCls  = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm';
const selectCls = `${inputCls} bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`;
const textaCls  = `${inputCls} resize-none`;

function Field({ label, required, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required
          ? <span className="text-red-500 ml-0.5">*</span>
          : <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

// ── Tag input for requiredDocuments ──────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };

  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div className="border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-red-500 bg-white">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 text-xs rounded-full font-medium">
            {t}
            <button type="button" onClick={() => removeTag(i)} className="hover:text-red-900 leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Type a document name and press Enter"
          className="flex-1 text-sm outline-none px-1 py-0.5 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40 px-1"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 mb-5">
      <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function PostScholarshipPage() {
  const navigate = useNavigate();
  const { profile, userType } = useAuth();

  // ── Form state ────────────────────────────────────────────────
  const [form, setForm] = useState({
    scholarshipTitle:  '',
    description:       '',
    scholarshipType:   '',
    applicationDeadline: '',
    // financialDetails
    amount:     '',
    totalSlots: '',
    // requirements
    eligibilityCriteria:    '',
    requiredDocuments:      [],
    additionalRequirements: '',
    // locationFilter
    provinceId:       '',
    provinceName:     '',
    districtId:       '',
    districtName:     '',
  });

  // ── Location cascade data ─────────────────────────────────────
  const [provinces,   setProvinces]   = useState([]);
  const [districts,   setDistricts]   = useState([]);
  const [loadingDist, setLoadingDist] = useState(false);

  // ── Submit state ──────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  // ── Min date for deadline (tomorrow) ─────────────────────────
  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ── Load provinces once ───────────────────────────────────────
  useEffect(() => {
    api.get('/locations/provinces')
      .then(r => setProvinces(r.data.data ?? []))
      .catch(() => {});
  }, []);

  // ── Load districts when province changes ──────────────────────
  useEffect(() => {
    if (!form.provinceId) { setDistricts([]); return; }
    let cancelled = false;
    setLoadingDist(true);
    api.get(`/locations/districts/${form.provinceId}`)
      .then(r => { if (!cancelled) setDistricts(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingDist(false); });
    return () => { cancelled = true; };
  }, [form.provinceId]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleProvinceChange = (e) => {
    const pid  = e.target.value;
    const prov = provinces.find(p => p._id === pid);
    setForm(f => ({ ...f, provinceId: pid, provinceName: prov?.provinceName ?? '', districtId: '', districtName: '' }));
  };

  const handleDistrictChange = (e) => {
    const did  = e.target.value;
    const dist = districts.find(d => d._id === did);
    setForm(f => ({ ...f, districtId: did, districtName: dist?.districtName ?? '' }));
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');

    // Client-side required field check
    if (!form.scholarshipTitle.trim()) { setError('Scholarship title is required.'); return; }
    if (!form.scholarshipType)         { setError('Please select a scholarship type.'); return; }
    if (!form.applicationDeadline)     { setError('Application deadline is required.'); return; }

    setSubmitting(true);
    try {
      // Build payload — only include optional sections if they have data
      const payload = {
        scholarshipTitle:    form.scholarshipTitle.trim(),
        scholarshipType:     form.scholarshipType,
        applicationDeadline: form.applicationDeadline,
      };

      if (form.description.trim()) payload.description = form.description.trim();

      // financialDetails — include if any value given
      if (form.amount || form.totalSlots) {
        payload.financialDetails = {};
        if (form.amount)     payload.financialDetails.amount     = Number(form.amount);
        if (form.totalSlots) payload.financialDetails.totalSlots = Number(form.totalSlots);
      }

      // requirements — include if any value given
      const hasReqs = form.eligibilityCriteria.trim() || form.requiredDocuments.length || form.additionalRequirements.trim();
      if (hasReqs) {
        payload.requirements = {};
        if (form.eligibilityCriteria.trim())    payload.requirements.eligibilityCriteria    = form.eligibilityCriteria.trim();
        if (form.requiredDocuments.length)      payload.requirements.requiredDocuments      = form.requiredDocuments;
        if (form.additionalRequirements.trim()) payload.requirements.additionalRequirements = form.additionalRequirements.trim();
      }

      // locationFilter — include if province selected
      if (form.provinceId) {
        payload.locationFilter = {
          province: { provinceId: form.provinceId, provinceName: form.provinceName },
        };
        if (form.districtId) {
          payload.locationFilter.district = { districtId: form.districtId, districtName: form.districtName };
        }
      }

      await api.post('/scholarships', payload);
      navigate('/dashboard/college?posted=1');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post scholarship. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guard: unverified college ─────────────────────────────────
  const verifyStatus = profile?.verification?.status ?? 'pending';
  if (userType === 'college' && verifyStatus !== 'verified') {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 pb-16 bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center mx-4">
            <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4 text-3xl">
              {verifyStatus === 'rejected' ? '❌' : '⏳'}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {verifyStatus === 'rejected' ? 'Account Rejected' : 'Awaiting Verification'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {verifyStatus === 'rejected'
                ? 'Your college account was rejected. Please contact support for assistance.'
                : 'Your college account is pending verification by a provincial admin. You can post scholarships once approved.'}
            </p>
            <Link to="/dashboard/college" className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─────────────────────────────────────────
  // RENDER — Main Form
  // ─────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="py-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post a Scholarship</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to publish a new scholarship.</p>
            </div>
            <Link to="/dashboard/college" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* ── Error banner ─────────────────────────────────── */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ── Section 1: Basic Info ─────────────────────────── */}
          <Section title="Basic Information">
            <Field label="Scholarship Title" required>
              <input
                type="text"
                value={form.scholarshipTitle}
                onChange={e => set('scholarshipTitle', e.target.value)}
                placeholder="e.g. Merit Scholarship for Science Students"
                className={inputCls}
                maxLength={200}
              />
            </Field>

            <Field label="Scholarship Type" required>
              <select value={form.scholarshipType} onChange={e => set('scholarshipType', e.target.value)} className={selectCls}>
                <option value="">Select type</option>
                <option value="merit">Merit — based on academic performance</option>
                <option value="reservation">Reservation — based on caste / disability / quota</option>
                <option value="both">Both — merit and reservation</option>
              </select>
            </Field>

            <Field label="Application Deadline" required>
              <input
                type="date"
                value={form.applicationDeadline}
                onChange={e => set('applicationDeadline', e.target.value)}
                min={minDate}
                className={inputCls}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={4}
                placeholder="Describe the scholarship, its purpose, and who it is for…"
                className={textaCls}
              />
            </Field>
          </Section>

          {/* ── Section 2: Financial Details ─────────────────── */}
          <Section title="Financial Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Scholarship Amount (NPR)">
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="e.g. 50000"
                  min={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Total Slots">
                <input
                  type="number"
                  value={form.totalSlots}
                  onChange={e => set('totalSlots', e.target.value)}
                  placeholder="e.g. 10"
                  min={1}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section 3: Eligibility & Requirements ────────── */}
          <Section title="Eligibility &amp; Requirements">
            <Field label="Eligibility Criteria">
              <textarea
                value={form.eligibilityCriteria}
                onChange={e => set('eligibilityCriteria', e.target.value)}
                rows={3}
                placeholder="e.g. Minimum GPA of 3.5 in +2, must be a Nepali citizen…"
                className={textaCls}
              />
            </Field>

            <Field
              label="Required Documents"
              hint="Press Enter or click Add after each document name."
            >
              <TagInput
                tags={form.requiredDocuments}
                onChange={docs => set('requiredDocuments', docs)}
              />
            </Field>

            <Field label="Additional Requirements">
              <textarea
                value={form.additionalRequirements}
                onChange={e => set('additionalRequirements', e.target.value)}
                rows={3}
                placeholder="Any other conditions or requirements applicants should know…"
                className={textaCls}
              />
            </Field>
          </Section>

          {/* ── Section 4: Location Filter ────────────────────── */}
          <Section title="Location Filter">
            <p className="text-sm text-gray-500 mb-5 -mt-2">
              Leave empty to accept applications from all of Nepal. Set a province or district to restrict eligibility.
            </p>

            <Field label="Restrict to Province">
              <select
                value={form.provinceId}
                onChange={handleProvinceChange}
                className={selectCls}
                disabled={provinces.length === 0}
              >
                <option value="">{provinces.length === 0 ? 'Loading…' : 'Open to all provinces'}</option>
                {provinces.map(p => <option key={p._id} value={p._id}>{p.provinceName}</option>)}
              </select>
            </Field>

            {form.provinceId && (
              <Field label="Further Restrict to District">
                <select
                  value={form.districtId}
                  onChange={handleDistrictChange}
                  className={selectCls}
                  disabled={loadingDist}
                >
                  <option value="">{loadingDist ? 'Loading…' : 'All districts in this province'}</option>
                  {districts.map(d => <option key={d._id} value={d._id}>{d.districtName}</option>)}
                </select>
              </Field>
            )}
          </Section>

          {/* ── Submit row ────────────────────────────────────── */}
          <div className="flex items-center justify-between py-2 mb-10">
            <Link to="/dashboard/college" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-7 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Publishing…' : 'Publish Scholarship'}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

export default PostScholarshipPage;