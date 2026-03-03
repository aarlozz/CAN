import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import Home from './pages/home';
import Dashboard from './pages/Dashboard/dashboard';

// ─────────────────────────────────────────
// Protected Route Guard
// Redirects to /login if no token in localStorage
// ─────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/signup"    element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;