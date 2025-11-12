import { create } from 'zustand';
import { User } from '@/types';
import apiClient from '@/lib/api';
import socketClient from '@/lib/socket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true, 
          isLoading: false 
        });

        // Connect to socket
        socketClient.connect(response.data.accessToken);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.register(data);
      
      if (response.success && response.data) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true, 
          isLoading: false 
        });

        // Connect to socket
        socketClient.connect(response.data.accessToken);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      socketClient.disconnect();
      set({ user: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    try {
      const token = apiClient.getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      set({ isLoading: true });
      const response = await apiClient.getCurrentUser();
      
      if (response.success && response.data) {
        set({ 
          user: response.data, 
          isAuthenticated: true, 
          isLoading: false 
        });

        // Connect to socket
        socketClient.connect(token);
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Load user error:', error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

