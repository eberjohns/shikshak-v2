import axios from 'axios';

// Base URL is read from Vite env VITE_API_URL; default to '' so relative paths work in dev
const baseURL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage for every request
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 to clear local auth (avoids stale tokens)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
