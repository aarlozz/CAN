// Axios API instance — central place for all backend calls

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',  // ✅ VITE_ prefix (not REACT_APP_)
  timeout: 10000,            // prevent hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,     // enables cookies/auth headers
});

// ─────────────────────────────────────────
// REQUEST interceptor — attach JWT automatically
// ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
// RESPONSE interceptor — handle expired token globally
// ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;