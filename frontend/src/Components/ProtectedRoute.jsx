import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps any page that requires authentication.
 * Consumes global AuthContext state with seamless hydration protection.
 * @param {string[]} allowedRoles - optional list of roles permitted to access the route.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoggedIn, role, isLoading, DASHBOARD_ROUTES } = useAuth();

  // Prevent flash redirect while context is hydrating from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const destination = DASHBOARD_ROUTES?.[role] || "/";
    return <Navigate to={destination} replace />;
  }

  return children;
}
