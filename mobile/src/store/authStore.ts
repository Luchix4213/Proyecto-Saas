import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

interface User {
  usuario_id: number;
  email: string;
  nombre_completo: string;
  rol: string;
  tenant_id: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, expoPushToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  error: null,

  login: async (email, password, expoPushToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/login', { email, password, expoPushToken });
      const { access_token, user } = response.data; // Adjust based on actual backend response structure

      // Backend response from auth.controller logs usually return { access_token }
      // User data might need to be decoded or fetched separately if not included.
      // Based on AutenticacionService.login: return { access_token: string }

      // If user info is not in login response, we need to fetch it.
      // Let's assume we decode it or fetch profile. For now, let's fetch profile.

      await SecureStore.setItemAsync('auth_token', access_token);

      // Update client header immediately for the next request
      client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Fetch profile
      const profileResponse = await client.get('/auth/profile');

      set({
        token: access_token,
        user: profileResponse.data,
        isLoading: false
      });
    } catch (e: any) {
      console.error('Login error', e);
      set({
        error: e.response?.data?.message || 'Error al iniciar sesión',
        isLoading: false
      });
      throw e;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null });
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Verify token
        // Ideally call an endpoint to verify or just fetch profile
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const profileResponse = await client.get('/auth/profile');
        set({ token, user: profileResponse.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      // If error (token invalid), logout
      await SecureStore.deleteItemAsync('auth_token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
