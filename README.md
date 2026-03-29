# CAN
This is the official repository for CAN website. 
This has been written using MERN Stack. 

import { Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/signup";

import InstitutionSignup from "./pages/auth/institutionsignup";
import InstitutionLogin from "./pages/auth/institutionallogin";
import InstitutionalDashboard from "./pages/Dashboard/institutionaldashbaord";
function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<InstitutionSignup />} />
      <Route path="/login-institution" element={<InstitutionLogin />} />
     <Route path="/dashboard-institution" element={<InstitutionalDashboard />} />
      
    </Routes>
  );
}

export default App;

