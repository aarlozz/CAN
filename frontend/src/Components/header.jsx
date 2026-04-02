import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CAN_logo from "../assets/images/logo/CAN_logo.png"; // Assuming you have a logo image

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userType = !token ? "guest" : role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => {
    const isHashLink = to.includes("#");

    // For section scrolling (About, Contact)
    if (isHashLink) {
      return (
        <a
          href={to}
          className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          {label}
        </a>
      );
    }

    // Normal route navigation
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          isActive(to)
            ? "text-red-500 border-b-2 border-red-500 pb-0.5"
            : "text-gray-700 hover:text-red-500"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  };
  const navConfig = {
    guest: [
      { path: "/#home", label: "Home" },
      { path: "/#about", label: "About Us" },
      { path: "/#contact", label: "Contact" },
    ],
    student: [
      { path: "/institutions", label: "Institutions" },
      { path: "/dashboard-student", label: "Dashboard" },
    ],
    institution: [
      { path: "/dashboard-institution", label: "Dashboard" },
      { path: "/manage-scholarships", label: "Manage Scholarships" },
    ],
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-red-600 font-extrabold text-xl tracking-tight">
            <img src={CAN_logo} alt="CAN Logo" className="w-15 h-8" />
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navConfig[userType]?.map((item) => navLink(item.path, item.label))}
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
                to="/signup"
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Register
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
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navConfig[userType]?.map((item) => navLink(item.path, item.label))}
          {!token ? (
            <>
              {navLink("/login", "Login")}
              {navLink("/signup", "Register")}
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
