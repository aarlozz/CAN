
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

// FIXES:
// 1. Import names now match actual filenames exactly (scholarshipList not ScholarshipList)
// 2. Route was /scholarship/:id (singular) — FIXED to /scholarships/:id (plural)
//    Every link in the app navigates to /scholarships/:id, so the route must match

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    
      {/* Public scholarship pages — no login needed to browse */}
      <Route path="/scholarships" element={<ScholarshipList />} />
      <Route path="/scholarships/:id" element={<ScholarshipDetail />} />

      {/* Protected — Institution */}
      <Route
        path="/dashboard-institution"
        element={
          <ProtectedRoute allowedRoles={["institution"]}>
            <InstitutionalDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected — Student */}
      <Route
        path="/dashboard-student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected — any logged-in user */}
      <Route
        path="/institutions"
        element={
            <InstitutionList />
        }
      />
    </Routes>
  );
}

export default App;