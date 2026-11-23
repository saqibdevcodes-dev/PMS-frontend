import { expect, it } from 'vitest';
import { ownerNames, type CaseRecord } from '../../src/features/resources/OwnershipCasePrint';

const completedAt = '2026-11-21T10:00:00.000Z';
const base: CaseRecord = {
  id: 'transfer-id',
  status: 'COMPLETED',
  completedAt,
  buyer: { name: 'New owner' },
  booking: {
    reference: 'BKG-1',
    customer: { name: 'New owner' },
    unit: { number: 'Plot 7', project: { name: 'Garden', logoId: null } },
    owners: [
      { share: '100', validTo: completedAt, customer: { name: 'Previous owner' } },
      { share: '100', validTo: null, customer: { name: 'New owner' } },
    ],
  },
};

it('shows the historical owner on a completed transfer', () => {
  expect(ownerNames(base, 'transfers')).toBe('Previous owner');
  expect(ownerNames(base, 'possessions')).toBe('New owner');
});

it('labels the current owner on a pending transfer request', () => {
  expect(
    ownerNames(
      {
        ...base,
        status: 'PENDING',
        completedAt: null,
        booking: {
          ...base.booking,
          customer: { name: 'Previous owner' },
          owners: [{ share: '100', validTo: null, customer: { name: 'Previous owner' } }],
        },
      },
      'transfers',
    ),
  ).toBe('Previous owner');
});
