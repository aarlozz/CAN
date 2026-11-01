// CollegeSignup.jsx — College registration form
//
// Fields:   collegeName (req), email (req), password (req), confirm_password (req)
//           provinceId/provinceName (req) — cascade select
//           districtId/districtName (req) — cascade select (loads on province select)
//           municipalityId/municipalityName (opt) — cascade select (loads on district select)
//           addressLine (opt), websiteUrl (opt), phone (opt)
//
// Endpoint: POST /api/auth/register/college
// Success:  → /login?registered=college  (college needs admin verification first — no auto-login)

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import api from '../../services/api';

// ─────────────────────────────────────────────────────────────────
// Small reusable input component to keep JSX clean
// ─────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{' '}
        {required
          ? <span className="text-red-500">*</span>
          : <span className="text-gray-400 font-normal">(optional)</span>
        }
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm";
const selectCls = `${inputCls} bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`;

function CollegeSignup() {
  // ── Form values ──────────────────────────────────────────────
  const [form, setForm] = useState({
    collegeName:      '',
    email:            '',
    phone:            '',
    websiteUrl:       '',
    addressLine:      '',
    password:         '',
    confirm_password: '',
    // Location IDs + names (names stored for denormalization in backend)
    provinceId:       '',
    provinceName:     '',
    districtId:       '',
    districtName:     '',
    municipalityId:   '',
    municipalityName: '',
  });

  // ── Cascade dropdown data ────────────────────────────────────
  const [provinces,      setProvinces]      = useState([]);
  const [districts,      setDistricts]      = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  // ── Loading states for each cascade level ───────────────────
  const [loadingProvinces,      setLoadingProvinces]      = useState(true);
  const [loadingDistricts,      setLoadingDistricts]      = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  // ── Form error + submission ──────────────────────────────────
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ── Load provinces on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingProvinces(true);
    api.get('/locations/provinces')
      .then(res => {
        if (!cancelled) setProvinces(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load provinces. Please refresh the page.');
      })
      .finally(() => { if (!cancelled) setLoadingProvinces(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Load districts when provinceId changes ───────────────────
  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      setMunicipalities([]);
      return;
    }
    let cancelled = false;
    setLoadingDistricts(true);
    setDistricts([]);
    setMunicipalities([]);
    // Clear downstream selections
    setForm(f => ({ ...f, districtId: '', districtName: '', municipalityId: '', municipalityName: '' }));

    api.get(`/locations/districts/${form.provinceId}`)
      .then(res => {
        if (!cancelled) setDistricts(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load districts.');
      })
      .finally(() => { if (!cancelled) setLoadingDistricts(false); });
    return () => { cancelled = true; };
  }, [form.provinceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load municipalities when districtId changes ───────────────
  useEffect(() => {
    if (!form.districtId) {
      setMunicipalities([]);
      return;
    }
    let cancelled = false;
    setLoadingMunicipalities(true);
    setMunicipalities([]);
    setForm(f => ({ ...f, municipalityId: '', municipalityName: '' }));

    api.get(`/locations/municipalities/${form.districtId}`)
      .then(res => {
        if (!cancelled) setMunicipalities(res.data.data || []);
      })
      .catch(() => {
        // Municipalities are optional — silent fail is OK
      })
      .finally(() => { if (!cancelled) setLoadingMunicipalities(false); });
    return () => { cancelled = true; };
  }, [form.districtId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generic text/select change handler ───────────────────────
  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  // ── Province select — also stores name for denormalization ────
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province   = provinces.find(p => p._id === provinceId);
    setForm(f => ({
      ...f,
      provinceId,
      provinceName: province?.provinceName ?? '',
    }));
    setError('');
  };

  // ── District select — also stores name ───────────────────────
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const district   = districts.find(d => d._id === districtId);
    setForm(f => ({
      ...f,
      districtId,
      districtName: district?.districtName ?? '',
    }));
    setError('');
  };

  // ── Municipality select — also stores name ────────────────────
  const handleMunicipalityChange = (e) => {
    const municipalityId = e.target.value;
    const municipality   = municipalities.find(m => m._id === municipalityId);
    setForm(f => ({
      ...f,
      municipalityId,
      municipalityName: municipality?.municipalityName ?? '',
    }));
    setError('');
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.collegeName.trim() || !form.email.trim() || !form.password) {
      setError('College name, email and password are required.');
      return;
    }
    if (!form.provinceId || !form.districtId) {
      setError('Please select your province and district.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // Build exact payload the backend expects
      const payload = {
        collegeName:  form.collegeName.trim(),
        email:        form.email.trim().toLowerCase(),
        password:     form.password,
        provinceId:   form.provinceId,
        provinceName: form.provinceName,
        districtId:   form.districtId,
        districtName: form.districtName,
      };

      // Optional fields — only include if filled in
      if (form.municipalityId)        payload.municipalityId   = form.municipalityId;
      if (form.municipalityName)      payload.municipalityName = form.municipalityName;
      if (form.addressLine.trim())    payload.addressLine      = form.addressLine.trim();
      if (form.websiteUrl.trim())     payload.websiteUrl       = form.websiteUrl.trim();
      if (form.phone.trim())          payload.phone            = form.phone.trim();

      // POST /api/auth/register/college
      await api.post('/auth/register/college', payload);

      // College requires admin verification — do NOT auto-login
      // Redirect to /login with a query param so login page can show a success message
      navigate('/login?registered=college');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16 flex justify-center items-start px-4">
        <div className="w-full max-w-xl">

          {/* Back link */}
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
          >
            ← Back to role selection
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">College Registration</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your account will be reviewed by a provincial admin before activation.
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── College Info ─────────────────────────── */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                College Information
              </h2>

              <Field label="College Name" required>
                <input
                  type="text"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  placeholder="e.g. Tribhuvan University"
                  className={inputCls}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone">
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01-XXXXXXX"
                    className={inputCls}
                  />
                </Field>
                <Field label="Website">
                  <input
                    type="url"
                    name="websiteUrl"
                    value={form.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://college.edu.np"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* ── Location Cascade ─────────────────────── */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-2">
                Location
              </h2>

              {/* Province */}
              <Field label="Province" required>
                <select
                  name="provinceId"
                  value={form.provinceId}
                  onChange={handleProvinceChange}
                  className={selectCls}
                  disabled={loadingProvinces}
                  required
                >
                  <option value="">
                    {loadingProvinces ? 'Loading provinces…' : 'Select province'}
                  </option>
                  {provinces.map(p => (
                    <option key={p._id} value={p._id}>{p.provinceName}</option>
                  ))}
                </select>
              </Field>

              {/* District */}
              <Field label="District" required>
                <select
                  name="districtId"
                  value={form.districtId}
                  onChange={handleDistrictChange}
                  className={selectCls}
                  disabled={!form.provinceId || loadingDistricts}
                  required
                >
                  <option value="">
                    {!form.provinceId
                      ? 'Select a province first'
                      : loadingDistricts
                        ? 'Loading districts…'
                        : 'Select district'}
                  </option>
                  {districts.map(d => (
                    <option key={d._id} value={d._id}>{d.districtName}</option>
                  ))}
                </select>
              </Field>

              {/* Municipality */}
              <Field label="Municipality">
                <select
                  name="municipalityId"
                  value={form.municipalityId}
                  onChange={handleMunicipalityChange}
                  className={selectCls}
                  disabled={!form.districtId || loadingMunicipalities}
                >
                  <option value="">
                    {!form.districtId
                      ? 'Select a district first'
                      : loadingMunicipalities
                        ? 'Loading municipalities…'
                        : 'Select municipality (optional)'}
                  </option>
                  {municipalities.map(m => (
                    <option key={m._id} value={m._id}>{m.municipalityName} ({m.municipalityType})</option>
                  ))}
                </select>
              </Field>

              {/* Address Line */}
              <Field label="Address Line">
                <input
                  type="text"
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  placeholder="Street / Ward / Tole"
                  className={inputCls}
                />
              </Field>

              {/* ── Account Credentials ──────────────────── */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-2">
                Account Credentials
              </h2>

              <Field label="Email Address" required>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="college@example.edu.np"
                  className={inputCls}
                  required
                  autoComplete="email"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Password" required>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={inputCls}
                    required
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm Password" required>
                  <input
                    type="password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className={inputCls}
                    required
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || loadingProvinces}
                className="w-full mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? 'Submitting…' : 'Submit Registration'}
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-red-600 font-medium hover:underline">
                  Log in
                </Link>
              </p>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default CollegeSignup;