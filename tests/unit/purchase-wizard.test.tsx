import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyPurchaseWizard } from '../../src/features/resources/PropertyPurchaseWizard';
import { usePreferences } from '../../src/stores/preferences';
import { useAuth } from '../../src/stores/auth';
import type { User } from '../../src/lib/types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useAuth.getState().clear();
});

it.each(['empty state', 'dropdown'])(
  'opens the full Add property form from the inventory %s',
  async (entry) => {
    const projectId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    usePreferences.getState().setProject(projectId, 'Test project');
    useAuth.getState().setUser({ permissions: ['inventory.read', 'finance.read'] } as User);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
              data: { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } },
            }),
          ),
      ),
    );
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <PropertyPurchaseWizard onClose={() => {}} />
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByText('Select from Project Inventory'));
    await screen.findByText('No properties are available for purchase in this project.');
    if (entry === 'dropdown') {
      fireEvent.click(screen.getByRole('combobox', { name: 'Choose Property from Inventory' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Add New Property' }).at(-1)!);
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Add New Property' }));
    }
    for (const label of [
      'Property number',
      'Property area',
      'Property price',
      'Phase',
      'Block',
      'Sector',
      'Tower',
      'Floor',
    ]) {
      expect(screen.getByLabelText(new RegExp(label))).toBeDefined();
    }
    expect(screen.getByText('Property photos')).toBeDefined();
    expect(screen.getByText('Property features')).toBeDefined();
    expect(screen.getByRole('combobox', { name: 'Choose a feature' })).toBeDefined();
    fireEvent.click(screen.getByRole('combobox', { name: /Property type/ }));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Residential plot',
      'Commercial plot',
      'Apartment',
      'Shop',
      'Office',
      'Other',
    ]);
    fireEvent.click(screen.getByRole('option', { name: 'Other' }));
    expect(screen.getByLabelText('Other property type')).toBeDefined();
    fireEvent.click(screen.getByRole('combobox', { name: 'Area unit' }));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Marla',
      'Kanal',
      'Sq ft',
      'Sq yd',
      'Sq m',
      'Acre',
      'Hectare',
    ]);
    fireEvent.click(screen.getByRole('option', { name: 'Marla' }));
    for (const [label, value] of [
      ['Property number', 'LC-42'],
      ['Other property type', 'Warehouse'],
      ['Property area', '5'],
      ['Property price', '650000'],
      ['Phase', 'Phase 2'],
      ['Block', 'C'],
      ['Sector', 'East'],
      ['Tower', 'One'],
      ['Floor', 'Ground'],
    ]) {
      fireEvent.change(screen.getByLabelText(new RegExp(label!)), { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Continue to purchase details' }));
    expect(await screen.findByDisplayValue('LC-42')).toBeDefined();
    expect(screen.getByDisplayValue('Phase 2, C, East, One, Ground')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByDisplayValue('Warehouse')).toBeDefined();
    expect(screen.getByDisplayValue('LC-42')).toBeDefined();
    expect(screen.getByRole('combobox', { name: 'Area unit' }).textContent).toContain('Marla');
  },
);

it('loads saved draft expenses from the server before opening the edit form', async () => {
  const projectId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const purchaseId = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  usePreferences.getState().setProject(projectId, 'Test project');
  const purchase = {
    id: purchaseId,
    unitId: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    vendorId: 'dddddddd-dddd-4ddd-dddd-dddddddddddd',
    title: 'Plot A-1',
    location: 'Block A',
    fileReference: 'AGR-A-1',
    purchaseDate: '2026-11-20T00:00:00.000Z',
    price: '1000',
    taxes: '10',
    legalFees: '0',
    brokerage: '0',
    otherCosts: '1250',
    expenseItems: [
      { id: 'roof-1', name: 'Roof repairs', category: 'Renovation & Building', amount: '1250' },
    ],
    notes: 'Saved draft',
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['purchase-edit-record', projectId, purchaseId], {
    ...purchase,
    expenseItems: [],
  });
  const fetcher = vi.fn(async (url: string) => {
    const data = url.endsWith(`/property-purchases/${purchaseId}`)
      ? purchase
      : { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } };
    return new Response(JSON.stringify({ success: true, data }));
  });
  vi.stubGlobal('fetch', fetcher);
  render(
    <QueryClientProvider client={client}>
      <PropertyPurchaseWizard record={{ id: purchaseId }} onClose={() => {}} />
    </QueryClientProvider>,
  );
  await waitFor(() =>
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining(`/property-purchases/${purchaseId}`),
      expect.any(Object),
    ),
  );
  const expensesStep = await screen.findByRole('button', { name: /3\. Expenses & Finish/ });
  fireEvent.click(expensesStep);
  expect(screen.getByDisplayValue('Roof repairs')).toBeDefined();
  expect(screen.getByDisplayValue('Saved draft')).toBeDefined();
});

it('edits posted expenses in the three-step form without changing locked purchase details', async () => {
  const projectId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const purchaseId = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  const unitId = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
  const vendorId = 'dddddddd-dddd-4ddd-dddd-dddddddddddd';
  usePreferences.getState().setProject(projectId, 'Test project');
  useAuth.getState().setUser({ permissions: ['inventory.read'] } as User);
  const purchase = {
    id: purchaseId,
    status: 'POSTED',
    updatedAt: '2026-11-21T12:00:00.000Z',
    unitId,
    vendorId,
    title: 'Plot A-1',
    location: 'Block A',
    fileReference: 'AGR-A-1',
    purchaseDate: '2026-11-20T00:00:00.000Z',
    price: '1000',
    taxes: '10',
    legalFees: '0',
    brokerage: '0',
    otherCosts: '1250',
    expenseItems: [
      { id: 'roof-1', name: 'Roof repairs', category: 'Renovation & Building', amount: '1250' },
    ],
    notes: 'Posted purchase',
  };
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    const data =
      init?.method === 'PATCH'
        ? purchase
        : url.endsWith(`/property-purchases/${purchaseId}`)
          ? purchase
          : { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } };
    return new Response(JSON.stringify({ success: true, data }));
  });
  vi.stubGlobal('fetch', fetcher);
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <PropertyPurchaseWizard record={{ id: purchaseId }} onClose={() => {}} />
    </QueryClientProvider>,
  );
  const expenseStep = await screen.findByRole('button', { name: /3\. Expenses & Finish/ });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Next Step' }));
  expect((screen.getByLabelText(/Agreed Purchase Price/) as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(expenseStep);
  expect(screen.getByDisplayValue('Roof repairs')).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Save expenses' }));
  await waitFor(() => {
    const call = fetcher.mock.calls.find(
      ([url, init]) =>
        url.endsWith(`/property-purchases/${purchaseId}/expenses`) && init?.method === 'PATCH',
    );
    expect(call).toBeDefined();
    const payload = JSON.parse(String(call?.[1]?.body));
    expect(payload.expenseItems).toEqual([
      { id: 'roof-1', name: 'Roof repairs', category: 'Renovation & Building', amount: '1250.00' },
    ]);
    expect(payload.expectedUpdatedAt).toBe(purchase.updatedAt);
  });
});

it('shows property status at the end of each choice and keeps unavailable units disabled', async () => {
  const projectId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  usePreferences.getState().setProject(projectId, 'Test project');
  useAuth.getState().setUser({ permissions: ['inventory.read'] } as User);
  const units = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      number: 'Plot 1',
      type: 'RESIDENTIAL_PLOT',
      status: 'AVAILABLE',
      size: 5,
      measurementUnit: 'MARLA',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      number: 'Plot 2',
      type: 'RESIDENTIAL_PLOT',
      status: 'SOLD',
      size: 5,
      measurementUnit: 'MARLA',
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      number: 'Plot 3',
      type: 'RESIDENTIAL_PLOT',
      status: 'AVAILABLE',
      size: 5,
      measurementUnit: 'MARLA',
    },
  ];
  const purchases = [
    {
      id: '44444444-4444-4444-8444-444444444444',
      unitId: units[2]!.id,
      status: 'POSTED',
      reference: 'PUR-00000001',
    },
  ];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const items = url.includes('/property-purchases?')
        ? purchases
        : url.includes('/units?')
          ? units
          : [];
      return new Response(
        JSON.stringify({
          success: true,
          data: { items, pagination: { page: 1, limit: 100, total: items.length, totalPages: 1 } },
        }),
      );
    }),
  );
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <PropertyPurchaseWizard onClose={() => {}} />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByText('Select from Project Inventory'));
  fireEvent.click(screen.getByRole('combobox', { name: 'Choose Property from Inventory' }));
  const available = await screen.findByRole('option', { name: /Plot 1/ });
  const sold = screen.getByRole('option', { name: /Plot 2/ });
  const purchased = screen.getByRole('option', { name: /Plot 3/ });
  expect((available as HTMLButtonElement).disabled).toBe(false);
  expect((sold as HTMLButtonElement).disabled).toBe(true);
  expect((purchased as HTMLButtonElement).disabled).toBe(true);
  expect(sold.textContent).toContain('Sold');
  expect(purchased.textContent).toContain('Already purchased');
});
