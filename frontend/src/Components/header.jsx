import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CANlogo from "../assets/images/logo/CAN_logo.png";

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
          <img src={CANlogo} alt="CAN Logo" className="w-15 h-8" />
          <span className="text-gray-500 text-xs font-medium hidden sm:inline">CAN Federation</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {!token && navLink("/", "Home")}
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
              <Link to="/signup"
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Register
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
          {!token && navLink("/", "Home")}
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
