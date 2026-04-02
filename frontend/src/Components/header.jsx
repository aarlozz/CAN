<<<<<<< HEAD
// header.jsx — Auth-aware navigation header
//
// Logged out:  Home | Scholarships | Login | Sign Up
// Student:     Home | Scholarships | My Applications | [email] ▼ (Logout)
// College:     Home | My Scholarships | Post Scholarship | [email] ▼ (Logout)
// Admin/PA:    Home | Pending Colleges | Statistics | [email] ▼ (Logout)

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import CAN_logo from '../assets/images/logo/CAN_logo.png';
import { useAuth } from '../context/AuthContext';

// ── Role-specific nav links ───────────────────────────────────────
const NAV_LINKS = {
  student: [
    { to: '/',                     label: 'Home' },
    { to: '/scholarships',         label: 'Scholarships' },
    { to: '/dashboard/student',    label: 'My Applications' },
  ],
  college: [
    { to: '/',                        label: 'Home' },
    { to: '/dashboard/college',       label: 'My Scholarships' },
    { to: '/scholarships/new',        label: 'Post Scholarship' },
  ],
  admin: [
    { to: '/',                        label: 'Home' },
    { to: '/dashboard/admin',         label: 'Pending Colleges' },
    { to: '/dashboard/admin',         label: 'Statistics' },
  ],
  provincial_admin: [
    { to: '/',                        label: 'Home' },
    { to: '/dashboard/admin',         label: 'Pending Colleges' },
    { to: '/dashboard/admin',         label: 'Statistics' },
  ],
};

const PUBLIC_LINKS = [
  { to: '/',             label: 'Home' },
  { to: '/scholarships', label: 'Scholarships' },
];

function Header() {
  const { isLoggedIn, user, userType, logout } = useAuth();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const navigate = useNavigate();

  const navLinks = isLoggedIn ? (NAV_LINKS[userType] ?? PUBLIC_LINKS) : PUBLIC_LINKS;

  const handleLogout = async () => {
    setDropOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const activeCls = ({ isActive }) =>
    isActive
      ? 'text-red-600 font-semibold'
      : 'text-gray-700 hover:text-red-600 transition-colors';

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* ── Logo ───────────────────────────────────────────── */}
        <Link to="/" className="flex-shrink-0">
          <img src={CAN_logo} alt="CAN Logo" className="h-12 w-auto object-contain" />
        </Link>

        {/* ── Desktop Nav ────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.label} to={link.to} className={activeCls} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Desktop Auth area ──────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            /* User dropdown */
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-colors focus:outline-none"
              >
                {/* Avatar circle */}
                <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user?.email?.[0] ?? '?'}
                </span>
                <span className="max-w-[140px] truncate">{user?.email}</span>
                <svg className={`w-4 h-4 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (
                <>
                  {/* Click-away overlay */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{userType?.replace('_', ' ')}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile: hamburger ──────────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-gray-100 mt-2">
            {isLoggedIn ? (
              <>
                <p className="px-3 py-1.5 text-xs text-gray-400 truncate">{user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
=======
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${
        isActive(to)
          ? "text-red-500 border-b-2 border-red-500 pb-0.5"
          : "text-gray-700 hover:text-red-500"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-red-600 font-extrabold text-xl tracking-tight">CAN</span>
          <span className="text-gray-500 text-xs font-medium hidden sm:inline">Scholarship Portal</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLink("/", "Home")}
          {navLink("/scholarships", "Scholarships")}
          {token && role === "institution" && navLink("/dashboard-institution", "Dashboard")}
          {token && role === "student"      && navLink("/dashboard-student", "Dashboard")}
          {token && navLink("/institutions", "Institutions")}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors">
                Login
              </Link>
              <Link to="/signup-institution"
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Register Institution
              </Link>
            </>
          ) : (
            <button onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLink("/", "Home")}
          {navLink("/scholarships", "Scholarships")}
          {token && role === "institution" && navLink("/dashboard-institution", "Dashboard")}
          {token && role === "student"      && navLink("/dashboard-student", "Dashboard")}
          {token && navLink("/institutions", "Institutions")}
          {!token
            ? <>{navLink("/login", "Login")}{navLink("/signup-institution", "Register Institution")}</>
            : <button onClick={handleLogout} className="text-left text-sm font-medium text-red-500">Logout</button>
          }
        </div>
      )}
    </header>
  );
}
>>>>>>> e1fa25b551d5fdef7fb993a20ed4a57e87c8f083
