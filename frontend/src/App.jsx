import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import InstitutionSignup from "./pages/auth/institutionsignup";
import InstitutionLogin from "./pages/auth/institutionallogin";
import InstitutionList from "./pages/auth/InstitutionList";
import InstitutionalDashboard from "./pages/Dashboard/institutionaldashbaord";
import StudentDashboard from "./pages/Dashboard/studentdashboard";
import ScholarshipList from "./pages/scholarships/ScholarshipList";
import ScholarshipDetail from "./pages/scholarships/ScholarshipDetail";
import ProtectedRoute from "./Components/ProtectedRoute";
import CompleteProfile from "./pages/auth/completeprofile";
import Layout from "./Components/Layout";
import ProfileView from "./pages/ProfileView";
import BookmarksPage from "./pages/BookmarksPage";

function App() {
  return (
    <Routes>
      {/* Routes that share the Header/Footer + profile dropdown */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/scholarships" element={<ScholarshipList />} />
        <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
        <Route path="/institutions" element={<InstitutionList />} />

        {/* Protected — any logged-in user (student or institution) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "institution"]}>
              <ProfileView />
            </ProtectedRoute>
          }
        />

        {/* Protected — students only */}
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth pages — no shared header needed */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected — Institution (manages its own Header internally) */}
      <Route
        path="/dashboard-institution"
        element={
          <ProtectedRoute allowedRoles={["institution"]}>
            <InstitutionalDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected — Student (manages its own Header internally) */}
      <Route
        path="/dashboard-student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/complete-profile" element={<CompleteProfile />} />
    </Routes>
  );
}

export default App;