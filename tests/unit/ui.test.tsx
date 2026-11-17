import { it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, ErrorState } from '../../src/components/ui';
import { ApiError } from '../../src/lib/errors';
import { ResourceCardGrid } from '../../src/features/resources/ResourceCardGrid';

it('renders a linked button as one accessible anchor without breaking the application shell', () => {
  render(
    <Button asChild>
      <a href="/bookings">Open bookings</a>
    </Button>,
  );
  expect(screen.getByRole('link', { name: 'Open bookings' }).getAttribute('href')).toBe(
    '/bookings',
  );
  cleanup();
});
it('shows the validation problem without exposing a support reference number', () => {
  render(
    <ErrorState
      error={
        new ApiError(
          422,
          'VALIDATION_ERROR',
          'Request validation failed.',
          'reference-not-for-users',
          [{ path: ['number'], message: 'Enter a unique property number.' }],
        )
      }
    />,
  );
  expect(screen.getByRole('alert').textContent).toContain(
    'Property number: Enter a unique property number.',
  );
  expect(screen.getByRole('alert').textContent).not.toContain('reference-not-for-users');
  cleanup();
});
it('renders customer card with circular avatar, reference and details', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const customer = {
    id: 'cust-1',
    name: 'Muhammad Ali',
    reference: 'CUST-1001',
    fatherName: 'Tariq Ali',
    phone: '+92 300 1234567',
    email: 'ali@example.com',
    address: 'Phase 5, DHA',
    identityLast4: '5678',
    identityType: 'CNIC',
    paymentStatus: 'CONFIRMED',
    bookings: [{ id: 'b1' }],
  };
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <ResourceCardGrid
        kind="customers"
        records={[customer]}
        onOpen={() => {}}
        actions={() => <button>View</button>}
      />
    </QueryClientProvider>,
  );
  expect(screen.getByText('Muhammad Ali')).toBeDefined();
  expect(screen.getByText('CUST-1001')).toBeDefined();
  expect(screen.getByText('+92 300 1234567 · ali@example.com')).toBeDefined();
  expect(container.querySelector('.directory-card-avatar-wrap')).not.toBeNull();
  expect(container.querySelector('.directory-card-media--customer')).not.toBeNull();
  cleanup();
});
