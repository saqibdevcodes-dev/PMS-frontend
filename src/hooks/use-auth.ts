import { useEffect } from 'react';
import { api, refreshSession } from '../lib/api';
import { queryClient } from '../lib/query';
import { authTransport } from '../platform/adapter';
import { useAuth } from '../stores/auth';
import type { User } from '../lib/types';
let bootstrap: Promise<void> | undefined;
export function useInitializeAuth() {
  useEffect(() => {
    bootstrap ??= refreshSession()
      .then(async () => {
        useAuth.getState().setUser(await api<User>('/auth/me'));
      })
      .catch(() => useAuth.getState().clear());
    const channel = new BroadcastChannel('estate-session');
    channel.onmessage = (event) => {
      if (event.data === 'logout') {
        useAuth.getState().clear();
        queryClient.clear();
      }
    };
    const unsubscribe = useAuth.subscribe((state, previous) => {
      if (state.status === 'anonymous' && previous.status === 'authenticated') queryClient.clear();
    });
    return () => {
      channel.close();
      unsubscribe();
    };
  }, []);
}
export async function login(email: string, password: string) {
  const tokens = await authTransport.login(email, password);
  useAuth.getState().setToken(tokens.accessToken);
  try {
    useAuth.getState().setUser(await api<User>('/auth/me'));
  } catch (error) {
    useAuth.getState().clear();
    await authTransport.clear();
    throw error;
  }
}
export async function logout(all = false) {
  const userId = useAuth.getState().user?.id;
  const device = userId ? localStorage.getItem('estate-device-' + userId) : null;
  if (device) {
    await api('/devices/' + device, { method: 'DELETE' });
    localStorage.removeItem('estate-device-' + userId);
  }
  await api(all ? '/auth/logout-all' : '/auth/logout', { method: 'POST', body: {} });
  await authTransport.clear();
  useAuth.getState().clear();
  queryClient.clear();
  const channel = new BroadcastChannel('estate-session');
  channel.postMessage('logout');
  channel.close();
}
