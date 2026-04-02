import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — wraps any page that requires authentication.
 * Reads token + role from localStorage (set on login).
 * @param {string[]} allowedRoles - optional list of roles permitted to access the route.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  // Not logged in at all → send to general login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction — redirect to their dashboard or home
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "institution") return <Navigate to="/dashboard-institution" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
