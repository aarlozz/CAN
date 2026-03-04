// App.jsx — Application routes
//
// Route structure:
//   /                        → Home (public)
//   /login                   → Login (public — redirects if already logged in)
//   /signup                  → Signup role selector (public)
//   /signup/student          → Student registration
//   /signup/college          → College registration
//   /dashboard/student       → Student dashboard (student only)
//   /dashboard/college       → College dashboard (college only)
//   /dashboard/admin         → Admin dashboard (admin + provincial_admin)
//   /dashboard               → Redirects to role-specific dashboard

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, DASHBOARD_ROUTES } from './context/AuthContext';

import Home             from './pages/home';
import Login            from './pages/auth/login';
import Signup           from './pages/auth/signup';
import StudentSignup    from './pages/auth/StudentSignup';
import CollegeSignup    from './pages/auth/CollegeSignup';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import CollegeDashboard from './pages/Dashboard/CollegeDashboard';
import AdminDashboard   from './pages/Dashboard/AdminDashboard';
import ProtectedRoute   from './components/ProtectedRoute';

// ─────────────────────────────────────────────────────────────────
// PublicOnlyRoute — redirects already-logged-in users away from
// /login and /signup to their own dashboard
// ─────────────────────────────────────────────────────────────────
function PublicOnlyRoute({ children }) {
  const { isLoggedIn, userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoggedIn && userType) {
    return <Navigate to={DASHBOARD_ROUTES[userType] ?? '/'} replace />;
  }

  return children;
}

// ─────────────────────────────────────────────────────────────────
// DashboardRedirect — /dashboard → role-specific path
// ─────────────────────────────────────────────────────────────────
function DashboardRedirect() {
  const { isLoggedIn, userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to={DASHBOARD_ROUTES[userType] ?? '/'} replace />;
}

function App() {
  return (
    <Routes>
      {/* ── Public routes ──────────────────────────────────────── */}
      <Route path="/"               element={<Home />} />

      <Route path="/login"          element={
        <PublicOnlyRoute><Login /></PublicOnlyRoute>
      } />

      <Route path="/signup"         element={
        <PublicOnlyRoute><Signup /></PublicOnlyRoute>
      } />

      <Route path="/signup/student" element={
        <PublicOnlyRoute><StudentSignup /></PublicOnlyRoute>
      } />

      <Route path="/signup/college" element={
        <PublicOnlyRoute><CollegeSignup /></PublicOnlyRoute>
      } />

      {/* ── /dashboard → role-based redirect ───────────────────── */}
      <Route path="/dashboard"      element={<DashboardRedirect />} />

      {/* ── Protected role dashboards ───────────────────────────── */}
      <Route path="/dashboard/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/college" element={
        <ProtectedRoute allowedRoles={['college']}>
          <CollegeDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'provincial_admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── Catch-all → home ────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;