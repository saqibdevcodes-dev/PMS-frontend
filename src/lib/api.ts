import { useAuth } from '../stores/auth';
import { authTransport, apiBase } from '../platform/adapter';
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
    public details?: { path: (string | number)[]; message: string }[],
  ) {
    super(message);
  }
}
type Envelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: ApiError['details'] };
  meta?: { requestId?: string };
};
export async function decode<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !result?.success)
    throw new ApiError(
      response.status,
      result?.error?.code ?? 'REQUEST_FAILED',
      result?.error?.message ?? 'The service could not complete this request.',
      result?.meta?.requestId,
      result?.error?.details,
    );
  return result.data;
}
let refreshFlight: Promise<void> | undefined;
export function refreshSession(): Promise<void> {
  if (!refreshFlight) {
    const work = async () => {
      try {
        const result = await authTransport.refresh();
        useAuth.getState().setToken(result.accessToken);
      } catch (e) {
        useAuth.getState().clear();
        throw e;
      }
    };
    refreshFlight = Promise.resolve(
      typeof navigator !== 'undefined' && navigator.locks && !authTransport.native
        ? navigator.locks.request('estate-cookie-refresh', work)
        : work(),
    ).finally(() => {
      refreshFlight = undefined;
    });
  }
  return refreshFlight!;
}
export type RequestOptions = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  idempotencyKey?: string;
  anonymous?: boolean;
};
export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
  retried = false,
): Promise<T> {
  const originalToken = useAuth.getState().token;
  const isForm = options.body instanceof FormData;
  const headers: Record<string, string> = {
    'X-Client-Version': '1.0.0',
    'X-Request-Id': crypto.randomUUID(),
  };
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (originalToken && !options.anonymous) headers.Authorization = `Bearer ${originalToken}`;
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  let response: Response;
  try {
    response = await fetch(apiBase + path, {
      method: options.method ?? 'GET',
      headers,
      credentials: authTransport.native ? 'omit' : 'include',
      body:
        options.body === undefined
          ? undefined
          : isForm
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(30000)])
        : AbortSignal.timeout(30000),
    });
  } catch (e) {
    if (options.signal?.aborted) throw e;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      options.method && options.method !== 'GET'
        ? 'Connection interrupted. The result is uncertain. Check the record before submitting again.'
        : 'Unable to reach the service. Check your connection and try again.',
    );
  }
  if (response.status === 401 && !options.anonymous && !retried) {
    if (originalToken === useAuth.getState().token) await refreshSession();
    return api<T>(path, options, true);
  }
  if (response.status === 401 && !options.anonymous) useAuth.getState().clear();
  return decode<T>(response);
}
export function queryString(values: Record<string, unknown>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  const result = params.toString();
  return result ? '?' + result : '';
}
