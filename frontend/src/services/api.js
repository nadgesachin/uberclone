import axios from 'axios';

// Vite exposes env vars via import.meta.env. Use VITE_API_BASE_URL in your .env.
const BASE_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if present
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('rb_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return cfg;
}, (err) => Promise.reject(err));

// Response interceptor to normalize errors
api.interceptors.response.use((res) => res, (err) => {
  const message = err?.response?.data?.message || err.message || 'Network error';
  return Promise.reject(new Error(message));
});

export default api;
