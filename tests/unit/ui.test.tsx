import { it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button } from '../../src/components/ui';
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
