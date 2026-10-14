import { create } from 'zustand';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminState {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const API_BASE = 'http://localhost:5001/api/admin';

export const useAdminStore = create<AdminState>((set, get) => ({
  adminUser: (() => {
    try {
      const saved = localStorage.getItem('susama_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  adminToken: localStorage.getItem('susama_admin_token') || null,
  isAuthenticated: !!localStorage.getItem('susama_admin_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Invalid administrator credentials.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, message: errorMsg };
      }

      const { token, admin } = data.data;

      localStorage.setItem('susama_admin_token', token);
      localStorage.setItem('susama_admin_user', JSON.stringify(admin));

      set({
        adminToken: token,
        adminUser: admin,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, message: 'Welcome back to SUSÁMÁ Executive Console.' };
    } catch (err: any) {
      const errorMsg = err.message || 'Network connection failed. Please check backend server.';
      set({ error: errorMsg, isLoading: false });
      return { success: false, message: errorMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('susama_admin_token');
    localStorage.removeItem('susama_admin_user');
    set({
      adminToken: null,
      adminUser: null,
      isAuthenticated: false,
      error: null
    });
  },

  checkAuth: async () => {
    const token = get().adminToken || localStorage.getItem('susama_admin_token');
    if (!token) {
      get().logout();
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success && data.admin) {
        set({
          adminUser: data.admin,
          isAuthenticated: true,
          adminToken: token
        });
        localStorage.setItem('susama_admin_user', JSON.stringify(data.admin));
        return true;
      } else {
        get().logout();
        return false;
      }
    } catch {
      // In case of temporary offline/network hiccup, don't immediately wipe if token exists
      return !!token;
    }
  },

  clearError: () => set({ error: null }),

  getAuthHeaders: () => {
    const token = get().adminToken || localStorage.getItem('susama_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }
}));
