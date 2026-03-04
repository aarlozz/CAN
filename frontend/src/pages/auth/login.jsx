// login.jsx — Login page (all roles)
//
// Fixes from old version:
//   ✅ Uses AuthContext.login() instead of raw localStorage
//   ✅ Parses correct response shape: { token, user, profile }
//   ✅ Redirects to role-specific dashboard (not always /dashboard)
//   ✅ Loading spinner on button instead of just disabled

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Components/header';
import Footer from '../Components/footer';
import image15 from '../assets/images/image/image15.png';
import api from '../services/api';
import { useAuth, DASHBOARD_ROUTES } from '../context/AuthContext';

function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Show success banner when redirected here after college registration
  const justRegistered = new URLSearchParams(location.search).get('registered');

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

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);

      // Backend returns: { message, token, user: { id, email, userType }, profile }
      const { token, user, profile } = res.data;

      // Store in context + localStorage
      login(token, user, profile);

      // Redirect to the correct dashboard for this role
      navigate(DASHBOARD_ROUTES[user.userType] ?? '/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

      <main className="min-h-screen pt-24 flex justify-center items-start px-4 sm:px-6 md:px-8 lg:px-0">
        <section
          className="relative flex flex-col items-center justify-center bg-cover bg-center rounded-3xl w-full max-w-4xl md:max-w-5xl lg:max-w-6xl overflow-hidden"
          style={{ backgroundImage: `url(${image15})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/50" />

          {/* Heading */}
          <p className="text-3xl font-bold z-10 mt-10 mb-2 text-center px-4">
            Login to CAN Scholarship
          </p>
          <p className="text-sm text-gray-600 z-10 mb-6">
            Students, Colleges, and Admins all log in here
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md mx-4 mb-10"
          >
            {/* College registration success banner */}
            {justRegistered === 'college' && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm">
                ✅ College registered successfully! Your account is <strong>pending verification</strong> by a provincial admin. You can log in once verified.
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
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

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                required
                autoComplete="current-password"
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
              {loading ? 'Logging in…' : 'Login'}
            </button>

            {/* Links */}
            <p className="mt-4 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-red-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Login;