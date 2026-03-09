// App.jsx — Application routes (Phase 4 — final)
//
// Route structure:
//   /                        → Home (public)
//   /login                   → Login (public — redirects if already logged in)
//   /signup                  → Signup role selector (public)
//   /signup/student          → Student registration
//   /signup/college          → College registration
//   /scholarships            → Scholarship list/search (public)
//   /scholarships/new        → Post new scholarship (college, verified only)
//   /scholarships/:id        → Scholarship detail + apply (public)
//   /profile/student         → Student profile editor (student only)
//   /dashboard               → Redirects to role-specific dashboard
//   /dashboard/student       → Student dashboard (student only)
//   /dashboard/college       → College dashboard (college only)
//   /dashboard/admin         → Admin dashboard (admin + provincial_admin)
//   *                        → Redirect to /

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, DASHBOARD_ROUTES } from './context/AuthContext';

import Home                  from './pages/home';
import Login                 from './pages/auth/login';
import Signup                from './pages/auth/signup';
import StudentSignup         from './pages/auth/StudentSignup';
import CollegeSignup         from './pages/auth/CollegeSignup';
import ScholarshipListPage   from './pages/ScholarshipListPage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import PostScholarshipPage   from './pages/PostScholarshipPage';
import StudentProfilePage    from './pages/StudentProfilePage';
import StudentDashboard      from './pages/Dashboard/StudentDashboard';
import CollegeDashboard      from './pages/Dashboard/CollegeDashboard';
import AdminDashboard        from './pages/Dashboard/AdminDashboard';
import ProtectedRoute        from './Components/ProtectedRoute';

// ── Spinner shown while auth hydrates ────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── PublicOnlyRoute — bounces logged-in users to their dashboard ──
function PublicOnlyRoute({ children }) {
  const { isLoggedIn, userType, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isLoggedIn && userType) return <Navigate to={DASHBOARD_ROUTES[userType] ?? '/'} replace />;
  return children;
}

// ── DashboardRedirect — /dashboard → role-specific path ──────────
function DashboardRedirect() {
  const { isLoggedIn, userType, isLoading } = useAuth();
  if (isLoading)   return <Spinner />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to={DASHBOARD_ROUTES[userType] ?? '/'} replace />;
}

// ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>

      {/* ── Public routes ─────────────────────────────────────── */}
      <Route path="/"                element={<Home />} />

      <Route path="/login"           element={
        <PublicOnlyRoute><Login /></PublicOnlyRoute>
      } />

      <Route path="/signup"          element={
        <PublicOnlyRoute><Signup /></PublicOnlyRoute>
      } />

      <Route path="/signup/student"  element={
        <PublicOnlyRoute><StudentSignup /></PublicOnlyRoute>
      } />

      <Route path="/signup/college"  element={
        <PublicOnlyRoute><CollegeSignup /></PublicOnlyRoute>
      } />

      {/* Scholarships — public browsing */}
      <Route path="/scholarships"    element={<ScholarshipListPage />} />

      {/* /scholarships/new MUST come before /scholarships/:id
          so React Router doesn't treat "new" as an :id param    */}
      <Route path="/scholarships/new" element={
        <ProtectedRoute allowedRoles={['college']}>
          <PostScholarshipPage />
        </ProtectedRoute>
      } />

      <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />

      {/* ── Protected: student profile editor ─────────────────── */}
      <Route path="/profile/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProfilePage />
        </ProtectedRoute>
      } />

      {/* ── /dashboard → role-based redirect ──────────────────── */}
      <Route path="/dashboard"       element={<DashboardRedirect />} />

      {/* ── Role dashboards ────────────────────────────────────── */}
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

      <Route path="/dashboard/admin"   element={
        <ProtectedRoute allowedRoles={['admin', 'provincial_admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── Catch-all ──────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;