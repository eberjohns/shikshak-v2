// src/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null, // This will now store the full user object { id, email, full_name, role }
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const params = new URLSearchParams();
          params.append('username', email);
          params.append('password', password);

          const response = await apiClient.post('/auth/login', params, {
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });

          const { access_token } = response.data;
          set({ token: access_token }); // Set token immediately

          // NOW, FETCH THE USER DETAILS
          const userDetailsResponse = await apiClient.get('/users/me');
          set({ user: userDetailsResponse.data, isAuthenticated: true });

          return { success: true, role: userDetailsResponse.data.role }; // Return the role for redirection
        } catch (error) {
          console.error('Login failed:', error);
          // Clean up on failure
          set({ token: null, user: null, isAuthenticated: false });
          return { success: false, message: error.response?.data?.detail || 'Login failed' };
        }
      },
      register: async (userData) => {
        try {
          await apiClient.post('/auth/register', userData);
          return { success: true };
        } catch (error) {
          console.error('Registration failed:', error);
           return { success: false, message: error.response?.data?.detail || 'Registration failed' };
        }
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
