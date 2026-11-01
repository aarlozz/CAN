// AuthContext.jsx — Global unified authentication state
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────────
// DASHBOARD ROUTE MAP
// Unified mapping of role to destination route
// ─────────────────────────────────────────────────────────────────
export const DASHBOARD_ROUTES = {
  student: '/dashboard-student',
  institution: '/dashboard-institution',
  super_admin: '/dashboard-superadmin',
  province_admin: '/dashboard-provinceadmin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, role }
  const [profile, setProfile] = useState(null); // role-specific profile data
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while hydrating from localStorage

  // ── Storage helpers (dual-key compatibility) ──────────────────────────────
  const _clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('can_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('can_user');
    localStorage.removeItem('can_profile');
  };

  const _saveToStorage = (tokenVal, roleVal, userVal, profileVal) => {
    if (tokenVal) {
      localStorage.setItem('token', tokenVal);
      localStorage.setItem('can_token', tokenVal);
    }
    if (roleVal) {
      localStorage.setItem('role', roleVal);
    }
    if (userVal) {
      localStorage.setItem('can_user', JSON.stringify(userVal));
      localStorage.setItem('user', JSON.stringify(userVal));
    }
    if (profileVal) {
      localStorage.setItem('can_profile', JSON.stringify(profileVal));
    } else {
      localStorage.removeItem('can_profile');
    }
  };

  // ── Hydrate from localStorage on first load ──────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('can_token');
      const storedRole = localStorage.getItem('role');
      const storedUserRaw = localStorage.getItem('can_user') || localStorage.getItem('user');
      const storedProfileRaw = localStorage.getItem('can_profile');

      if (storedToken) {
        setToken(storedToken);
        const parsedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
        setUser(parsedUser);

        const activeRole = storedRole || parsedUser?.role || null;
        setRole(activeRole);

        if (storedProfileRaw) {
          setProfile(JSON.parse(storedProfileRaw));
        }
      }
    } catch {
      _clearStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── login(token, role, user, profile) ────────────────────────────────────
  const login = useCallback((tokenVal, roleVal, userVal, profileVal) => {
    const resolvedRole = roleVal || userVal?.role;
    setToken(tokenVal);
    setRole(resolvedRole);
    setUser(userVal || null);
    setProfile(profileVal || null);
    _saveToStorage(tokenVal, resolvedRole, userVal, profileVal);
  }, []);

  // ── logout() ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUser(null);
    setProfile(null);
    _clearStorage();
  }, []);

  // ── refreshProfile(newProfile) ───────────────────────────────────────────
  const refreshProfile = useCallback((newProfile) => {
    setProfile(newProfile);
    if (newProfile) {
      localStorage.setItem('can_profile', JSON.stringify(newProfile));
    }
  }, []);

  const value = {
    user,
    token,
    role,
    profile,
    isLoggedIn: !!token,
    isLoading,
    login,
    logout,
    refreshProfile,
    DASHBOARD_ROUTES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ──────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}