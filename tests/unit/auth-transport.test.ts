import { afterEach, describe, expect, it, vi } from 'vitest';
import { authTransport } from '../../src/platform/adapter';
import { ApiError } from '../../src/lib/errors';

afterEach(() => vi.unstubAllGlobals());

describe('browser authentication errors', () => {
  it('keeps the backend support reference and error status on login failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' },
            meta: { requestId: 'login-support-reference' },
          }),
          { status: 500 },
        ),
      ),
    );
    await expect(authTransport.login('test@example.invalid', 'test-only')).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
      requestId: 'login-support-reference',
    });
  });
  it('reports an upstream HTML error as an API failure instead of a JSON parser error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<h1>Bad Gateway</h1>', {
          status: 502,
          headers: { 'X-Request-Id': 'proxy-support-reference' },
        }),
      ),
    );
    const error = await authTransport
      .login('test@example.invalid', 'test-only')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, requestId: 'proxy-support-reference' });
  });
});
