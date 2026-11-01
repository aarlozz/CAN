import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";

// Public & General Pages
import Home from "./pages/home";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import CompleteProfile from "./pages/auth/CompleteProfile";
import InstitutionSignupStart from "./pages/auth/InstitutionSignupStart";
import CompleteInstitutionProfile from "./pages/auth/CompleteInstitutionProfile";
import InstitutionList from "./pages/auth/InstitutionList";
import InstitutionDetail from "./pages/auth/InstitutionDetail";

// Scholarship Pages
import ScholarshipList from "./pages/scholarships/scholarshipList";
import ScholarshipDetail from "./pages/scholarships/scholarshipDetail";
import BookmarksPage from "./pages/BookmarksPage";

// Profile View
import ProfileView from "./pages/ProfileView";

// Dashboards
import StudentDashboard from "./pages/Dashboard/studentdashboard";
import InstitutionalDashboard from "./pages/Dashboard/institutionaldashbaord";
import SuperAdminDashboard from "./pages/Dashboard/SuperAdminDashboard";
import ProvinceAdminDashboard from "./pages/Dashboard/ProvinceAdminDashboard";

function App() {
  return (
    <Routes>
      {/* Routes that share the Header/Footer Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/scholarships" element={<ScholarshipList />} />
        <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
        <Route path="/institutions" element={<InstitutionList />} />
        <Route path="/institutions/:id" element={<InstitutionDetail />} />

        {/* Protected Profile (Student or Institution) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "institution"]}>
              <ProfileView />
            </ProtectedRoute>
          }
        />

        {/* Protected Bookmarks (Students only) */}
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth & Onboarding Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/institution" element={<InstitutionSignupStart />} />
      <Route path="/complete-institution-profile" element={<CompleteInstitutionProfile />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />

      {/* Protected Dashboards */}
      <Route
        path="/dashboard-student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-institution"
        element={
          <ProtectedRoute allowedRoles={["institution"]}>
            <InstitutionalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-superadmin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-provinceadmin"
        element={
          <ProtectedRoute allowedRoles={["province_admin"]}>
            <ProvinceAdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;