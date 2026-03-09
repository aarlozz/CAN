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