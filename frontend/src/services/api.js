import axios from 'axios';

const api = axios.create({
    baseURL : import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,                 //Prevent hanging requests
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,      //Enables secure cookies (future)
})


// Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;