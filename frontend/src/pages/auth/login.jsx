<<<<<<< HEAD
// login.jsx — Login page (all roles)
//
// Fixes from old version:
//   ✅ Uses AuthContext.login() instead of raw localStorage
//   ✅ Parses correct response shape: { token, user, profile }
//   ✅ Redirects to role-specific dashboard (not always /dashboard)
//   ✅ Loading spinner on button instead of just disabled

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import image15 from '../../assets/images/image/image15.png';
import api from '../../services/api';
import { useAuth, DASHBOARD_ROUTES } from '../../context/AuthContext';

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
=======
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // General login route — handles both student and institution
      const res = await axios.post(`${API}/api/authbuild/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "institution") {
        navigate("/dashboard-institution");
      } else if (res.data.role === "student") {
        navigate("/dashboard-student");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <span className="text-red-500 font-extrabold text-2xl">CAN</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>
>>>>>>> e1fa25b551d5fdef7fb993a20ed4a57e87c8f083

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-red-500 hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <p>
              Institution account?{" "}
              <Link to="/login-institution" className="text-red-500 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}

export default Login;
=======
}
>>>>>>> e1fa25b551d5fdef7fb993a20ed4a57e87c8f083
