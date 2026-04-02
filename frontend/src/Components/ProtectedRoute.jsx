<<<<<<< HEAD
// ProtectedRoute.jsx — Auth + role-based route guard
//
// Usage:
//   // Any logged-in user:
//   <ProtectedRoute><Dashboard /></ProtectedRoute>
//
//   // College only:
//   <ProtectedRoute allowedRoles={['college']}><CollegeDashboard /></ProtectedRoute>
//
//   // Admin + provincial_admin:
//   <ProtectedRoute allowedRoles={['admin', 'provincial_admin']}><AdminDashboard /></ProtectedRoute>
//
// Behaviour:
//   • While auth is hydrating from localStorage → shows a spinner (prevents flash)
//   • No token → redirect to /login
//   • Wrong role → redirect to their own correct dashboard (not a 403 page)

import { Navigate } from 'react-router-dom';
import { useAuth, DASHBOARD_ROUTES } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, userType, isLoading } = useAuth();

  // ── Still hydrating from localStorage ────────────────────────────────────
  // Without this guard, there's a flash where isLoggedIn=false before
  // localStorage has been read, causing a spurious redirect to /login.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in → /login ────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // ── Wrong role → redirect to correct dashboard ────────────────────────────
  if (allowedRoles && !allowedRoles.includes(userType)) {
    const correctPath = DASHBOARD_ROUTES[userType] ?? '/';
    return <Navigate to={correctPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
=======
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
>>>>>>> e1fa25b551d5fdef7fb993a20ed4a57e87c8f083
