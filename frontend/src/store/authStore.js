// zustand v4+ exports a named `create` function. Some bundlers expose a default; handle both safely.
import * as zustand from 'zustand';
import apiClient from '../lib/apiClient';

// Prefer the named export `create`, but fall back to default or module itself when necessary.
const create = typeof zustand.create === 'function' ? zustand.create : (typeof zustand.default === 'function' ? zustand.default : (() => { throw new Error('zustand create not found') }));

const initialUser = (() => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
})();

const initialToken = (() => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
})();

const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,

  setUserAndToken: (user, token) => {
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch {
      // ignore
    }
    set({ user, token, isAuthenticated: !!token });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // OAuth2PasswordRequestForm expects form-encoded fields 'username' and 'password'
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const resp = await apiClient.post('/api/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = resp.data?.access_token || null;
      // Save token so subsequent requests (like /me) include Authorization header
      get().setUserAndToken(null, token);

      let user = null;
      if (token) {
        try {
          const me = await apiClient.get('/api/auth/me');
          user = me.data;
          get().setUserAndToken(user, token);
        } catch (e) {
          // ignore user fetch error; keep token
        }
      }

      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: err?.response?.data || err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const resp = await apiClient.post('/api/auth/register', payload);
      // Some backends return token immediately on register; handle both cases
      const token = resp.data?.token || null;
      const user = resp.data?.user || resp.data || null;
      if (token) get().setUserAndToken(user, token);
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: err?.response?.data || err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
