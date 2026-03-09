// Axios API instance — central place for all backend calls

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─────────────────────────────────────────
// REQUEST interceptor — attach JWT automatically
// ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('can_token'); // ✅ matches AuthContext key
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
      localStorage.removeItem('can_token');   // ✅ matches AuthContext key
      localStorage.removeItem('can_user');
      localStorage.removeItem('can_profile');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;