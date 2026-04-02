import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import InstitutionSignup from "./pages/auth/institutionsignup";
import InstitutionLogin from "./pages/auth/institutionallogin";
import InstitutionList from "./pages/auth/InstitutionList";
import InstitutionalDashboard from "./pages/Dashboard/institutionaldashbaord"; // keep your existing filename
import StudentDashboard from "./pages/Dashboard/studentdashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import CreateScholarship from "./pages/scholarship/scholarshipCreate";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/all-institutions" element={<InstitutionList />} />
      



      {/* Protected — Institution */}
      <Route
        path="/dashboard-institution"
        element={
          <ProtectedRoute allowedRoles={["institution"]}>
            <InstitutionalDashboard />
          </ProtectedRoute>
        }
      />
      {/* Protected — Institution */}
      <Route
        path="/manage-scholarships"
        element={
          <ProtectedRoute allowedRoles={["institution"]}>
            <CreateScholarship />
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

      {/* Protected — any logged-in user
      <Route
        path="/institutions"
        element={
          <ProtectedRoute allowedRoles={["student", "institution", "district_admin", "province_admin", "super_admin"]}>
            <InstitutionList />
          </ProtectedRoute>
        }
      /> */}
    </Routes>
  );
}

export default App;