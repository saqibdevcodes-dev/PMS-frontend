import { it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button, ErrorState } from '../../src/components/ui';
import { ApiError } from '../../src/lib/errors';
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
