// AuthContext.jsx — Global authentication state
//
// Provides: { user, token, userType, profile, login, logout, isLoading }
//
// Usage anywhere in the app:
//   import { useAuth } from '../../context/AuthContext';
//   const { user, userType, logout } = useAuth();

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────────
// DASHBOARD ROUTE MAP
// Determines where each role lands after login / when redirecting
// ─────────────────────────────────────────────────────────────────
export const DASHBOARD_ROUTES = {
  student:          '/dashboard/student',
  college:          '/dashboard/college',
  admin:            '/dashboard/admin',
  provincial_admin: '/dashboard/admin',   // shares admin dashboard, scoped server-side
};

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);    // { id, email, userType }
  const [profile,   setProfile]   = useState(null);    // role-specific profile data
  const [token,     setToken]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);    // true while hydrating from localStorage

  // ── Hydrate from localStorage on first load ──────────────────────────────
  // Runs once on mount. Restores session if token + user exist in storage.
  useEffect(() => {
    try {
      const storedToken   = localStorage.getItem('can_token');
      const storedUser    = localStorage.getItem('can_user');
      const storedProfile = localStorage.getItem('can_profile');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedProfile) setProfile(JSON.parse(storedProfile));
      }
    } catch {
      // Corrupted localStorage — clear it and start fresh
      _clearStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Storage helpers ───────────────────────────────────────────────────────
  const _clearStorage = () => {
    localStorage.removeItem('can_token');
    localStorage.removeItem('can_user');
    localStorage.removeItem('can_profile');
  };

  const _saveToStorage = (token, user, profile) => {
    localStorage.setItem('can_token', token);
    localStorage.setItem('can_user',  JSON.stringify(user));
    if (profile) localStorage.setItem('can_profile', JSON.stringify(profile));
    else         localStorage.removeItem('can_profile');
  };

  // ── login(token, user, profile) ───────────────────────────────────────────
  // Called by login.jsx after a successful API response.
  // Stores everything in state + localStorage.
  const login = useCallback((token, user, profile) => {
    setToken(token);
    setUser(user);
    setProfile(profile);
    _saveToStorage(token, user, profile);
  }, []);

  // ── logout() ─────────────────────────────────────────────────────────────
  // Calls backend to clear refresh tokens, then clears local state.
  // Silent-fails on API error (expired token still lets you log out locally).
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — clear local state regardless
    }
    setToken(null);
    setUser(null);
    setProfile(null);
    _clearStorage();
  }, []);

  // ── refreshProfile(newProfile) ───────────────────────────────────────────
  // Called when a role-specific dashboard fetches fresh data.
  // Updates the profile in context + localStorage without re-login.
  const refreshProfile = useCallback((newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('can_profile', JSON.stringify(newProfile));
  }, []);

  const value = {
    user,
    token,
    profile,
    userType:  user?.userType ?? null,
    isLoggedIn: !!token,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ──────────────────────────────────────────────────────────
// Throws clearly if used outside <AuthProvider>
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}