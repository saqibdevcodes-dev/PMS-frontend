import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { authTransport } from '../platform/adapter';

export function verificationLink(base: string, params: Record<string, string>) {
  try {
    const url = new URL('/verify', base);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    url.search = new URLSearchParams(params).toString();
    return url.href;
  } catch {
    return '';
  }
}

export function useVerificationLink(params: Record<string, string>) {
  const config = useQuery({
    queryKey: ['public-app-config'],
    staleTime: Infinity,
    queryFn: ({ signal }) =>
      api<{ publicWebUrl?: string }>('/compatibility', { anonymous: true, signal }),
  });
  const configured = import.meta.env.VITE_PUBLIC_WEB_URL as string | undefined;
  const base =
    configured ||
    config.data?.publicWebUrl ||
    (!authTransport.native ? window.location.origin : '');
  return verificationLink(base, params);
}
