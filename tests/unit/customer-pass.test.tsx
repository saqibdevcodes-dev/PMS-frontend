import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CustomerPassCard, customerPassIdentity } from '../../src/features/crm/CustomerPassCard';
import { verificationLink } from '../../src/lib/verification-link';
import { usePreferences } from '../../src/stores/preferences';

afterEach(cleanup);

it('prints the linked company, official code and matching QR destination', () => {
  usePreferences.getState().setLanguage('en');
  const customer = {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    reference: 'CUS-00000123',
    name: 'Abdullah',
    project: { name: 'Garden Homes', company: { name: 'Acme Estates' } },
    owners: [{ validTo: null, booking: { status: 'CONFIRMED' } }],
  };
  const url = verificationLink('https://example.test', { customer: customer.reference });
  render(<CustomerPassCard customer={customer} verificationUrl={url} />);
  expect(screen.getByText('Acme Estates')).toBeDefined();
  expect(screen.getByText('Project: Garden Homes')).toBeDefined();
  expect(screen.getByText('CUS-00000123')).toBeDefined();
  expect(screen.getByText('Authorized Property Owner')).toBeDefined();
  expect(screen.getByLabelText(`QR Code for ${url}`)).toBeDefined();
});

it('does not call a draft booking or former owner a verified property owner', () => {
  const customer = {
    id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    reference: 'CUS-00000124',
    name: 'New customer',
    project: { name: 'Legacy Project', company: null },
    owners: [{ validTo: null, booking: { status: 'DRAFT' } }],
  };
  expect(customerPassIdentity(customer)).toMatchObject({
    companyName: 'Legacy Project',
    ownsProperty: false,
  });
  render(<CustomerPassCard customer={customer} verificationUrl="" />);
  expect(screen.getByText('Customer Registration Pass')).toBeDefined();
  expect(screen.getByText('Customer registration')).toBeDefined();
  expect(screen.getByText('Verification link unavailable')).toBeDefined();
});
