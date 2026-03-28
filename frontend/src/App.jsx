import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import InstitutionSignup from "./pages/auth/institutionsignup";
import InstitutionLogin from "./pages/auth/institutionallogin";
import InstitutionList from "./pages/auth/InstitutionList";
import InstitutionalDashboard from "./pages/Dashboard/institutionaldashbaord";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-institution" element={<InstitutionSignup />} />
      <Route path="/login-institution" element={<InstitutionLogin />} />

      {/* Protected routes */}
      <Route
        path="/dashboard-institution"
        element={
          <ProtectedRoute allowedRoles={["institution"]}>
            <InstitutionalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institutions"
        element={
          <ProtectedRoute allowedRoles={["institution", "district_admin", "province_admin", "super_admin"]}>
            <InstitutionList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;