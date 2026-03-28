import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <h3 className="text-white font-extrabold text-xl mb-3 tracking-tight">
            CAN <span className="text-red-400">Federation</span>
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            Computer Association of Nepal — connecting students with scholarships
            across the nation since 1992.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/signup-institution", label: "Register Institution" },
              { to: "/login-institution", label: "Institution Login" },
              { to: "/institutions", label: "View Institutions" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Kathmandu, Nepal</li>
            <li>info@can.org.np</li>
            <li>+977-01-4444444</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} CAN Federation. All rights reserved.
      </div>
    </footer>
  );
}