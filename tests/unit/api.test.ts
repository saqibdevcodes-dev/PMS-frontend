import { beforeEach, describe, it, expect, vi } from 'vitest';
const transport = vi.hoisted(() => ({ native: false, refresh: vi.fn(), clear: vi.fn() }));
vi.mock('../../src/platform/adapter', () => ({ apiBase: '/api/v1', authTransport: transport }));
import { api, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/stores/auth';
const envelope = (data: unknown, status = 200) =>
  new Response(
    JSON.stringify(
      status === 200
        ? { success: true, data }
        : {
            success: false,
            error: { code: 'EXPIRED', message: 'Expired' },
            meta: { requestId: 'support-id' },
          },
    ),
    { status, headers: { 'Content-Type': 'application/json' } },
  );
beforeEach(() => {
  vi.unstubAllGlobals();
  transport.refresh.mockReset();
  useAuth.getState().clear();
  useAuth.getState().setToken('old');
});
describe('session and financial request transport', () => {
  it('serializes concurrent refresh and retries protected queries with the new access token', async () => {
    transport.refresh.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { accessToken: 'new' };
    });
    const fetcher = vi.fn(async (_url: string, init: RequestInit) =>
      new Headers(init.headers).get('authorization') === 'Bearer old'
        ? envelope({}, 401)
        : envelope({ ok: true }),
    );
    vi.stubGlobal('fetch', fetcher);
    const results = await Promise.all([api('/one'), api('/two'), api('/three')]);
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(transport.refresh).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(6);
  });
  it('does not replay an uncertain payment after a network failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('Network failure'));
    vi.stubGlobal('fetch', fetcher);
    await expect(
      api('/payments', {
        method: 'POST',
        body: { amount: '100.01' },
        idempotencyKey: 'test-payment-key',
      }),
    ).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(transport.refresh).not.toHaveBeenCalled();
    const options = fetcher.mock.calls[0]![1] as RequestInit;
    expect(new Headers(options.headers).get('Idempotency-Key')).toBe('test-payment-key');
    expect(JSON.parse(String(options.body)).amount).toBe('100.01');
  });
  it('retains server request IDs and clears invalid sessions after refresh failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(envelope({}, 403)));
    await expect(api('/restricted')).rejects.toMatchObject({
      status: 403,
      requestId: 'support-id',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(envelope({}, 401)));
    transport.refresh.mockRejectedValue(new ApiError(401, 'INVALID', 'Sign in again'));
    await expect(api('/expired')).rejects.toThrow('Sign in again');
    expect(useAuth.getState().token).toBeNull();
  });
});
