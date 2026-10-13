import { create } from 'zustand';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  district?: string | null;
  postal_code?: string | null;
  created_at?: string;
  last_login?: string;
}

interface AuthState {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Modal state
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  
  // Actions
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const API_BASE = 'http://localhost:5001/api/auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: (() => {
    try {
      const saved = localStorage.getItem('susama_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('susama_token') || null,
  isAuthenticated: !!localStorage.getItem('susama_token'),
  isLoading: false,
  error: null,

  isAuthModalOpen: false,
  authModalMode: 'signin',

  openAuthModal: (mode = 'signin') => {
    set({ isAuthModalOpen: true, authModalMode: mode, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  setAuthModalMode: (mode) => {
    set({ authModalMode: mode, error: null });
  },

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.message || 'Invalid email or password.';
        set({ isLoading: false, error: errorMsg });
        return { success: false, message: errorMsg };
      }

      const { token, customer } = data.data;

      localStorage.setItem('susama_token', token);
      localStorage.setItem('susama_customer', JSON.stringify(customer));

      set({
        token,
        customer,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAuthModalOpen: false
      });

      return { success: true, message: data.message || 'Welcome back!' };
    } catch (err: any) {
      const errorMsg = 'Unable to connect to the server. Please check your connection.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, message: errorMsg };
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.message || 'Registration failed.';
        set({ isLoading: false, error: errorMsg });
        return { success: false, message: errorMsg };
      }

      const { token, customer } = data.data;

      localStorage.setItem('susama_token', token);
      localStorage.setItem('susama_customer', JSON.stringify(customer));

      set({
        token,
        customer,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAuthModalOpen: false
      });

      return { success: true, message: data.message || 'Account created successfully!' };
    } catch (err: any) {
      const errorMsg = 'Unable to connect to the server. Please check your connection.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, message: errorMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('susama_token');
    localStorage.removeItem('susama_customer');
    set({
      customer: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, customer: null });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        set({ customer: data.data, isAuthenticated: true });
        localStorage.setItem('susama_customer', JSON.stringify(data.data));
      } else {
        // Token expired or invalid
        get().logout();
      }
    } catch {
      // If offline/server down, keep existing local storage session
    }
  },

  updateProfile: async (profileData: Partial<Customer>) => {
    const token = get().token;
    if (!token) return { success: false, message: 'Please sign in first.' };

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        set({ isLoading: false, error: data.message || 'Update failed.' });
        return { success: false, message: data.message || 'Update failed.' };
      }

      set({ customer: data.data, isLoading: false });
      localStorage.setItem('susama_customer', JSON.stringify(data.data));
      return { success: true, message: data.message || 'Profile updated successfully!' };
    } catch {
      set({ isLoading: false, error: 'Network error' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  }
}));
