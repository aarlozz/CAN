// StudentProfilePage.jsx  —  /profile/student
//
// Protected (student only).
// 4 tabs: Personal Info | Location | Guardian Info | Education
// Each section saves independently via PUT /api/student/profile.
// Location tab has province→district→municipality cascade dropdowns.
// Profile completion bar shown at top from GET /api/student/profile/completion.
//
// API:
//   GET /api/student/profile             → pre-fill all form sections
//   GET /api/student/profile/completion  → completion percentage + sections
//   PUT /api/student/profile             → partial update (nested $set)

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/header';
import Footer from '../Components/footer';
import api from '../services/api';

// ── Tabs ──────────────────────────────────────────────────────────
const TABS = [
  { key: 'personal',   label: 'Personal Info' },
  { key: 'location',   label: 'Location' },
  { key: 'guardian',   label: 'Guardian Info' },
  { key: 'education',  label: 'Education' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const SCHOOL_TYPES   = ['Government', 'Community', 'Private', 'Other'];

// ── Reusable field wrapper ────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{' '}
        {required
          ? <span className="text-red-500">*</span>
          : <span className="text-gray-400 font-normal">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls  = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm';
const selectCls = `${inputCls} bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`;

// ── Completion bar ────────────────────────────────────────────────
function CompletionBar({ completion }) {
  if (!completion) return null;
  const { percentage, sections } = completion;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">Profile Completion</p>
        <p className={`text-sm font-bold ${percentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
          {percentage}%
        </p>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {sections.map(sec => (
          <span
            key={sec.key}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sec.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {sec.completed ? '✓ ' : ''}{sec.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudentProfilePage() {
  const [activeTab,    setActiveTab]    = useState('personal');
  const [profile,      setProfile]      = useState(null);
  const [completion,   setCompletion]   = useState(null);
  const [loadingPage,  setLoadingPage]  = useState(true);

  // ── Per-tab form state ────────────────────────────────────────
  const [personal,  setPersonal]  = useState({ fullName: '', gender: '', dateOfBirth: '', phone: '' });
  const [location,  setLocation]  = useState({ provinceId: '', provinceName: '', districtId: '', districtName: '', municipalityId: '', municipalityName: '', addressLine: '' });
  const [guardian,  setGuardian]  = useState({ name: '', phone: '', relation: '' });
  const [education, setEducation] = useState({ schoolName: '', schoolType: '', currentEducationLevel: '' });

  // ── Cascade dropdown data ─────────────────────────────────────
  const [provinces,      setProvinces]      = useState([]);
  const [districts,      setDistricts]      = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingDist,    setLoadingDist]    = useState(false);
  const [loadingMuni,    setLoadingMuni]    = useState(false);

  // ── Per-tab save state ────────────────────────────────────────
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState('');  // '' | 'success' | error string
  const [saveTab,    setSaveTab]    = useState('');  // which tab just saved

  // ── Fetch profile + completion on mount ──────────────────────
  const fetchProfile = useCallback(async () => {
    setLoadingPage(true);
    try {
      const [profRes, compRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/profile/completion'),
      ]);
      const p = profRes.data.data;
      setProfile(p);
      setCompletion(compRes.data.data);

      // Pre-fill forms
      setPersonal({
        fullName:    p.personalInfo?.fullName    ?? '',
        gender:      p.personalInfo?.gender      ?? '',
        dateOfBirth: p.personalInfo?.dateOfBirth
          ? new Date(p.personalInfo.dateOfBirth).toISOString().split('T')[0]
          : '',
        phone:       p.personalInfo?.phone       ?? '',
      });
      setLocation({
        provinceId:       p.location?.province?.provinceId?._id     ?? p.location?.province?.provinceId     ?? '',
        provinceName:     p.location?.province?.provinceName         ?? '',
        districtId:       p.location?.district?.districtId?._id     ?? p.location?.district?.districtId     ?? '',
        districtName:     p.location?.district?.districtName         ?? '',
        municipalityId:   p.location?.municipality?.municipalityId?._id ?? p.location?.municipality?.municipalityId ?? '',
        municipalityName: p.location?.municipality?.municipalityName ?? '',
        addressLine:      p.location?.addressLine                    ?? '',
      });
      setGuardian({
        name:     p.guardianInfo?.name     ?? '',
        phone:    p.guardianInfo?.phone    ?? '',
        relation: p.guardianInfo?.relation ?? '',
      });
      setEducation({
        schoolName:            p.educationInfo?.schoolName            ?? '',
        schoolType:            p.educationInfo?.schoolType            ?? '',
        currentEducationLevel: p.educationInfo?.currentEducationLevel ?? '',
      });
    } catch (err) {
      console.error('Profile load error', err);
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Load provinces once ───────────────────────────────────────
  useEffect(() => {
    api.get('/locations/provinces')
      .then(r => setProvinces(r.data.data ?? []))
      .catch(() => {});
  }, []);

  // ── Load districts when provinceId set ───────────────────────
  useEffect(() => {
    if (!location.provinceId) { setDistricts([]); setMunicipalities([]); return; }
    let cancelled = false;
    setLoadingDist(true);
    api.get(`/locations/districts/${location.provinceId}`)
      .then(r => { if (!cancelled) setDistricts(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingDist(false); });
    return () => { cancelled = true; };
  }, [location.provinceId]);

  // ── Load municipalities when districtId set ───────────────────
  useEffect(() => {
    if (!location.districtId) { setMunicipalities([]); return; }
    let cancelled = false;
    setLoadingMuni(true);
    api.get(`/locations/municipalities/${location.districtId}`)
      .then(r => { if (!cancelled) setMunicipalities(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingMuni(false); });
    return () => { cancelled = true; };
  }, [location.districtId]);

  // ── Province select handler ───────────────────────────────────
  const handleProvinceChange = (e) => {
    const pid = e.target.value;
    const prov = provinces.find(p => p._id === pid);
    setLocation(l => ({ ...l, provinceId: pid, provinceName: prov?.provinceName ?? '', districtId: '', districtName: '', municipalityId: '', municipalityName: '' }));
  };

  const handleDistrictChange = (e) => {
    const did = e.target.value;
    const dist = districts.find(d => d._id === did);
    setLocation(l => ({ ...l, districtId: did, districtName: dist?.districtName ?? '', municipalityId: '', municipalityName: '' }));
  };

  const handleMunicipalityChange = (e) => {
    const mid = e.target.value;
    const muni = municipalities.find(m => m._id === mid);
    setLocation(l => ({ ...l, municipalityId: mid, municipalityName: muni?.municipalityName ?? '' }));
  };

  // ── Save a section ────────────────────────────────────────────
  const showSaveResult = (tab, msg) => {
    setSaveTab(tab);
    setSaveMsg(msg);
    if (msg === 'success') {
      // Refresh completion
      api.get('/student/profile/completion')
        .then(r => setCompletion(r.data.data))
        .catch(() => {});
    }
    setTimeout(() => { setSaveMsg(''); setSaveTab(''); }, 3000);
  };

  const handleSave = async (tab) => {
    setSaving(true);
    setSaveMsg('');
    setSaveTab('');
    try {
      let body = {};

      if (tab === 'personal') {
        body.personalInfo = { ...personal };
        if (!body.personalInfo.dateOfBirth) delete body.personalInfo.dateOfBirth;
        if (!body.personalInfo.phone)       delete body.personalInfo.phone;
      }

      if (tab === 'location') {
        body.location = {
          province:     location.provinceId     ? { provinceId:     location.provinceId,     provinceName:     location.provinceName     } : undefined,
          district:     location.districtId     ? { districtId:     location.districtId,     districtName:     location.districtName     } : undefined,
          municipality: location.municipalityId ? { municipalityId: location.municipalityId, municipalityName: location.municipalityName } : undefined,
          addressLine:  location.addressLine    || undefined,
        };
        // strip undefined keys
        Object.keys(body.location).forEach(k => { if (body.location[k] === undefined) delete body.location[k]; });
      }

      if (tab === 'guardian') {
        body.guardianInfo = { ...guardian };
      }

      if (tab === 'education') {
        body.educationInfo = { ...education };
      }

      await api.put('/student/profile', body);
      showSaveResult(tab, 'success');
    } catch (err) {
      showSaveResult(tab, err.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Save feedback component ───────────────────────────────────
  function SaveFeedback({ tab }) {
    if (saveTab !== tab || !saveMsg) return null;
    return (
      <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm ${saveMsg === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        {saveMsg === 'success' ? '✓ Saved successfully' : saveMsg}
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  if (loadingPage) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 pb-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
            <div className="h-7 w-48 bg-gray-100 rounded mb-6" />
            <div className="h-16 bg-gray-100 rounded-2xl mb-6" />
            <div className="h-96 bg-gray-100 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="py-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500 mt-0.5">Complete your profile to unlock scholarship applications.</p>
            </div>
            <Link to="/dashboard/student" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* ── Completion bar ───────────────────────────────── */}
          <CompletionBar completion={completion} />

          {/* ── Tab nav ──────────────────────────────────────── */}
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSaveMsg(''); setSaveTab(''); }}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

            {/* ── Personal Info ─────────────────────────────── */}
            {activeTab === 'personal' && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>

                <Field label="Full Name" required>
                  <input type="text" value={personal.fullName} onChange={e => setPersonal(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Ram Bahadur Thapa" className={inputCls} />
                </Field>

                <Field label="Gender" required>
                  <select value={personal.gender} onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))} className={selectCls}>
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Date of Birth">
                    <input type="date" value={personal.dateOfBirth} onChange={e => setPersonal(p => ({ ...p, dateOfBirth: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                      placeholder="98XXXXXXXX" className={inputCls} />
                  </Field>
                </div>

                <button onClick={() => handleSave('personal')} disabled={saving} className="mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                  {saving && saveTab === 'personal' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save Personal Info
                </button>
                <SaveFeedback tab="personal" />
              </div>
            )}

            {/* ── Location ──────────────────────────────────── */}
            {activeTab === 'location' && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Location</h2>

                <Field label="Province" required>
                  <select value={location.provinceId} onChange={handleProvinceChange} className={selectCls}
                    disabled={provinces.length === 0}>
                    <option value="">{provinces.length === 0 ? 'Loading…' : 'Select province'}</option>
                    {provinces.map(p => <option key={p._id} value={p._id}>{p.provinceName}</option>)}
                  </select>
                </Field>

                <Field label="District" required>
                  <select value={location.districtId} onChange={handleDistrictChange} className={selectCls}
                    disabled={!location.provinceId || loadingDist}>
                    <option value="">{!location.provinceId ? 'Select a province first' : loadingDist ? 'Loading…' : 'Select district'}</option>
                    {districts.map(d => <option key={d._id} value={d._id}>{d.districtName}</option>)}
                  </select>
                </Field>

                <Field label="Municipality">
                  <select value={location.municipalityId} onChange={handleMunicipalityChange} className={selectCls}
                    disabled={!location.districtId || loadingMuni}>
                    <option value="">{!location.districtId ? 'Select a district first' : loadingMuni ? 'Loading…' : 'Select municipality (optional)'}</option>
                    {municipalities.map(m => <option key={m._id} value={m._id}>{m.municipalityName} ({m.municipalityType})</option>)}
                  </select>
                </Field>

                <Field label="Street / Ward / Tole">
                  <input type="text" value={location.addressLine} onChange={e => setLocation(l => ({ ...l, addressLine: e.target.value }))}
                    placeholder="e.g. Ward 5, Thamel" className={inputCls} />
                </Field>

                <button onClick={() => handleSave('location')} disabled={saving} className="mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                  {saving && saveTab === 'location' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save Location
                </button>
                <SaveFeedback tab="location" />
              </div>
            )}

            {/* ── Guardian Info ─────────────────────────────── */}
            {activeTab === 'guardian' && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Guardian Information</h2>

                <Field label="Guardian Name" required>
                  <input type="text" value={guardian.name} onChange={e => setGuardian(g => ({ ...g, name: e.target.value }))}
                    placeholder="Full name of parent/guardian" className={inputCls} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Guardian Phone" required>
                    <input type="tel" value={guardian.phone} onChange={e => setGuardian(g => ({ ...g, phone: e.target.value }))}
                      placeholder="98XXXXXXXX" className={inputCls} />
                  </Field>
                  <Field label="Relation" required>
                    <input type="text" value={guardian.relation} onChange={e => setGuardian(g => ({ ...g, relation: e.target.value }))}
                      placeholder="e.g. Father, Mother, Uncle" className={inputCls} />
                  </Field>
                </div>

                <button onClick={() => handleSave('guardian')} disabled={saving} className="mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                  {saving && saveTab === 'guardian' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save Guardian Info
                </button>
                <SaveFeedback tab="guardian" />
              </div>
            )}

            {/* ── Education ─────────────────────────────────── */}
            {activeTab === 'education' && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Education Information</h2>

                <Field label="School / College Name" required>
                  <input type="text" value={education.schoolName} onChange={e => setEducation(ed => ({ ...ed, schoolName: e.target.value }))}
                    placeholder="e.g. Tri-Chandra Multiple Campus" className={inputCls} />
                </Field>

                <Field label="School Type" required>
                  <select value={education.schoolType} onChange={e => setEducation(ed => ({ ...ed, schoolType: e.target.value }))} className={selectCls}>
                    <option value="">Select type</option>
                    {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Current Education Level" required>
                  <input type="text" value={education.currentEducationLevel} onChange={e => setEducation(ed => ({ ...ed, currentEducationLevel: e.target.value }))}
                    placeholder="e.g. +2 Science, Bachelor 2nd Year" className={inputCls} />
                </Field>

                <button onClick={() => handleSave('education')} disabled={saving} className="mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                  {saving && saveTab === 'education' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save Education Info
                </button>
                <SaveFeedback tab="education" />
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default StudentProfilePage;