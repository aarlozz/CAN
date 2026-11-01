// api.js — Central Axios client with URL normalization and auto-auth
import axios from 'axios';

// Resolve base URL safely, ensuring clean /api mounting without duplicate prefixes
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const cleanBase = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');

const api = axios.create({
  baseURL: `${cleanBase}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────
// REQUEST interceptor — attach JWT & prevent double /api/ prefix
// ─────────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // If a caller passes '/api/something', strip leading '/api' so it doesn't duplicate to '/api/api/something'
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = localStorage.getItem('token') || localStorage.getItem('can_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────
// RESPONSE interceptor — global 401 session expiration handling
// ─────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('can_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('can_user');
      localStorage.removeItem('can_profile');

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;