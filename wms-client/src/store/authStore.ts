import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  init: () => void;
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!(initialToken && initialRefreshToken),
  setAuth: (token, refreshToken, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    set({ token, refreshToken, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
  init: () => {
    // Already synchronously initialized
  },
}));
