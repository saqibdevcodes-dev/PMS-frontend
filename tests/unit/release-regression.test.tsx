import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const transport = vi.hoisted(() => ({ native: false, refresh: vi.fn(), clear: vi.fn() }));
vi.mock('../../src/platform/adapter', () => ({ apiBase: '/api/v1', authTransport: transport }));
import { api } from '../../src/lib/api';
import { moneyPayload, exactMoney } from '../../src/lib/exact-money';
import { verificationLink } from '../../src/lib/verification-link';
import { useAuth } from '../../src/stores/auth';
import { usePreferences } from '../../src/stores/preferences';
import MemberQrPage from '../../src/features/crm/MemberQrPage';
import type { User } from '../../src/lib/types';

const customerId = '99999999-9999-4999-8999-999999999999';
const envelope = (data: unknown) => new Response(JSON.stringify({ success: true, data }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  transport.refresh.mockReset();
});

it('keeps a valid session and never retries an incorrect confirmation password', async () => {
  useAuth.getState().setToken('valid-session');
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'Incorrect password.' },
        }),
        { status: 401 },
      ),
  );
  vi.stubGlobal('fetch', fetcher);
  await expect(
    api('/projects/project/units/unit', { method: 'DELETE', body: { password: 'wrong' } }),
  ).rejects.toMatchObject({ code: 'INVALID_PASSWORD' });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(transport.refresh).not.toHaveBeenCalled();
  expect(useAuth.getState().token).toBe('valid-session');
});

function renderPass(found: boolean) {
  usePreferences.getState().setProject('project', 'Test project');
  useAuth
    .getState()
    .setUser({ id: 'staff', permissions: ['customers.read'], projects: [] } as unknown as User);
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/compatibility')) return envelope({ publicWebUrl: 'https://example.test' });
      if (url.includes('/customers/' + customerId))
        return found
          ? envelope({
              id: customerId,
              name: 'Selected customer beyond page one',
              paymentStatus: 'UNASSIGNED',
            })
          : new Response(
              JSON.stringify({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Customer not found.' },
              }),
              { status: 404 },
            );
      return envelope({
        items: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'First customer',
            paymentStatus: 'FULLY_PAID',
          },
        ],
        pagination: { page: 1, limit: 25, total: 101, totalPages: 5 },
      });
    }),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/customers/qr?customerId=' + customerId]}>
        <MemberQrPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { ...view, client };
}

it('never substitutes the first customer when an explicit QR customer is missing', async () => {
  const view = renderPass(false);
  await waitFor(() => expect(view.getByText('Customer not found.')).toBeTruthy());
  expect(view.container.querySelector('.id-card-name')).toBeNull();
  expect(view.queryByRole('button', { name: 'Print customer pass' })).toBeNull();
  view.client.clear();
});

it('loads the canonical QR customer beyond page one and labels an unassigned customer correctly', async () => {
  const view = renderPass(true);
  await waitFor(() =>
    expect(view.container.querySelector('.id-card-name')?.textContent).toBe(
      'Selected customer beyond page one',
    ),
  );
  expect(view.container.querySelector('.id-card-role')?.textContent).toBe('Registered customer');
  expect(
    view.container.querySelector('[aria-label^="QR Code for"]')?.getAttribute('aria-label'),
  ).toContain(customerId);
  view.client.clear();
});

it('preserves cents in large purchase amounts and exact expense sums', () => {
  expect(moneyPayload('90071992547409.91')).toBe('90071992547409.91');
  expect(exactMoney('0.1').plus('0.2').toFixed(2)).toBe('0.30');
  expect(() => moneyPayload('1.001')).toThrow();
});

it('uses public HTTP links and refuses native internal origins for QR codes', () => {
  expect(verificationLink('https://example.test', { customer: customerId })).toBe(
    'https://example.test/verify?customer=' + customerId,
  );
  expect(verificationLink('pms://app', { customer: customerId })).toBe('');
  expect(verificationLink('https://user:password@example.test', { customer: customerId })).toBe('');
});
