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

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        isActive(to) ? "text-red-500 border-b-2 border-red-500 pb-0.5" : "text-gray-700 hover:text-red-500"
      }`}
      onClick={() => setMenuOpen(false)}
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
          {token && role === "institution" && navLink("/dashboard-institution", "Dashboard")}
          {token && navLink("/institutions", "Institutions")}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup-institution"
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Register Institution
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
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
          {token && role === "institution" && navLink("/dashboard-institution", "Dashboard")}
          {token && navLink("/institutions", "Institutions")}
          {!token ? (
            <>
              {navLink("/login", "Login")}
              {navLink("/signup-institution", "Register Institution")}
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-left text-sm font-medium text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}