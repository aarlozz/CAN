// StudentSignup.jsx — Student registration form
//
// Fields:   fullName (req), gender (req), email (req), password (req),
//           confirm_password (req), phone (opt), dateOfBirth (opt)
// Endpoint: POST /api/auth/register/student
// Success:  auto-login via AuthContext → navigate to /dashboard/student
//           (students don't need verification — they can use the platform immediately)

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import api from '../../services/api';
import { useAuth, DASHBOARD_ROUTES } from '../../context/AuthContext';

const GENDER_OPTIONS = [
  { value: 'Male',              label: 'Male' },
  { value: 'Female',            label: 'Female' },
  { value: 'Other',             label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

function StudentSignup() {
  const [form, setForm] = useState({
    fullName:        '',
    gender:          '',
    email:           '',
    phone:           '',
    dateOfBirth:     '',
    password:        '',
    confirm_password:'',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.fullName || !form.gender || !form.email || !form.password) {
      setError('Please fill in all required fields.');
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

      // Build payload — strip confirm_password, strip empty optional fields
      const payload = {
        fullName: form.fullName.trim(),
        gender:   form.gender,
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      };
      if (form.phone.trim())       payload.phone       = form.phone.trim();
      if (form.dateOfBirth.trim()) payload.dateOfBirth = form.dateOfBirth;

      // POST /api/auth/register/student
      // Returns: { message, token, user: { id, email, userType }, profile: { studentId, fullName } }
      const res = await api.post('/auth/register/student', payload);

      const { token, user, profile } = res.data;

      // Auto-login — students are active immediately, no verification needed
      login(token, user, profile);
      navigate(DASHBOARD_ROUTES['student']);

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
        <div className="w-full max-w-lg">

          {/* Back link */}
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
          >
            ← Back to role selection
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Student Registration</h1>
            <p className="text-sm text-gray-500 mb-6">
              Create your account to search and apply for scholarships.
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ram Bahadur Thapa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>

              {/* Gender */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                  required
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Phone + DOB side by side on wider screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? 'Creating account…' : 'Create Student Account'}
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

export default StudentSignup;