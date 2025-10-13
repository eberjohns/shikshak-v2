// src/api/apiClient.js

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create an Axios instance with a base URL for our FastAPI backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from our Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
