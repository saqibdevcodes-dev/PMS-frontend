import { create } from 'zustand';
import type { User } from '../lib/types';
type AuthState = {
  token: string | null;
  user: User | null;
  status: 'initializing' | 'authenticated' | 'anonymous';
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
};
export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  status: 'initializing',
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user, status: 'authenticated' }),
  clear: () => set({ token: null, user: null, status: 'anonymous' }),
}));
export const can = (permission?: string) =>
  !permission || Boolean(useAuth.getState().user?.permissions.includes(permission));
