import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import { money } from '../../src/lib/format';
import { parseCsv } from '../../src/lib/csv';
import { normalize, validator } from '../../src/lib/schema';
import { operation } from '../../src/lib/contract';
import { allowedAction } from '../../src/features/resources/catalog';
import { useAuth } from '../../src/stores/auth';
import type { User } from '../../src/lib/types';
const require = createRequire(import.meta.url);
const { serverUrl, externalUrl, assetPath } = require('../../electron/security.cjs');
beforeEach(() => {
  useAuth.getState().clear();
  vi.restoreAllMocks();
});
describe('exact values and contract-driven validation', () => {
  it('formats decimal strings without losing cents or large integer precision', () => {
    expect(money('9007199254740993.25', 'PKR')).toBe('PKR 9,007,199,254,740,993.25');
    expect(money('0.10', 'USD')).toBe('USD 0.10');
    expect(money('bad')).toBe('—');
  });
  it('validates a real payment request without converting monetary values to numbers', () => {
    const schema = operation('post', '/projects/{projectId}/payments').body!;
    const body = {
      bookingId: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
      amount: '12.34',
      method: 'CASH',
      paidAt: '2026-09-23T10:00:00Z',
      receivingAccountId: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    };
    expect(validator(schema).safeParse(normalize(schema, body)).success).toBe(true);
    expect(validator(schema).safeParse({ ...body, amount: 12.34 }).success).toBe(false);
    expect(validator(schema).safeParse({ ...body, amount: '12.345' }).success).toBe(false);
    expect(validator(schema).safeParse({ ...body, method: 'UNSUPPORTED' }).success).toBe(false);
  });
  it('drops empty optional fields but preserves false and decimal zero', () => {
    const schema = {
      type: 'object',
      properties: {
        amount: { type: 'string' },
        notes: { type: 'string' },
        active: { type: 'boolean' },
      },
      required: ['amount'],
    };
    expect(normalize(schema, { amount: '0.00', notes: '', active: false })).toEqual({
      amount: '0.00',
      active: false,
    });
  });
  it('preserves explicit empty galleries on edits and leaves omitted galleries unchanged', () => {
    const schema = operation('patch', '/projects/{projectId}/units/{id}').body!;
    expect(normalize(schema, { photoIds: [] })).toEqual({ photoIds: [] });
    expect(normalize(schema, { number: 'A-104' })).toEqual({ number: 'A-104' });
    expect(
      validator(schema).safeParse({
        photoIds: Array(6).fill('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'),
      }).success,
    ).toBe(false);
    expect(schema.properties).not.toHaveProperty('price');
    expect(schema.properties).not.toHaveProperty('charges');
  });
});
describe('CSV inventory imports', () => {
  it('supports quoted separators, escaped quotes, CRLF, and exact amounts', () => {
    expect(
      parseCsv('number,price,phase\r\n"A,""1""",9007199254740993.25,"North\nSide"\r\n'),
    ).toEqual([{ number: 'A,"1"', price: '9007199254740993.25', phase: 'North\nSide' }]);
  });
  it('rejects ambiguous rows and duplicate headers', () => {
    expect(() => parseCsv('number,number\na,b')).toThrow('unique');
    expect(() => parseCsv('number,price\na')).toThrow('fields');
    expect(() => parseCsv('number\n"unfinished')).toThrow('Unclosed');
  });
});
describe('workflow permissions', () => {
  const user = {
    id: 'maker',
    name: 'Maker',
    email: 'maker@test.invalid',
    permissions: ['bookings.approve', 'payments.verify'],
    projects: [],
  } as User;
  it('allows direct confirmation only for permitted employees and draft bookings', () => {
    const op = operation('post', '/projects/{projectId}/bookings/{id}/confirm');
    useAuth.getState().setUser(user);
    expect(allowedAction(op, { status: 'DRAFT' })).toBe(true);
    expect(allowedAction(op, { status: 'CONFIRMED' })).toBe(false);
    useAuth.getState().setUser({ ...user, permissions: ['bookings.create'] });
    expect(allowedAction(op, { status: 'DRAFT' })).toBe(false);
  });
  it('still prevents the payment receiver from verifying their own payment', () => {
    const op = operation('post', '/projects/{projectId}/payments/{id}/verify');
    useAuth.getState().setUser(user);
    expect(allowedAction(op, { status: 'PENDING', receivedBy: user.id })).toBe(false);
    expect(allowedAction(op, { status: 'PENDING', receivedBy: 'other' })).toBe(true);
  });
});

describe('desktop security boundaries', () => {
  it('accepts localhost development and HTTPS production API URLs only', () => {
    expect(serverUrl('http://127.0.0.1:4000/api/v1')).toContain('4000');
    expect(serverUrl('https://pms.example/api/v1/')).toBe('https://pms.example/api/v1');
    for (const url of [
      'http://pms.example/api/v1',
      'https://user:secret@pms.example/api/v1',
      'file:///api/v1',
      'https://pms.example/other',
    ])
      expect(() => serverUrl(url)).toThrow();
  });
  it('rejects unsafe navigation and asset traversal', () => {
    for (const url of ['javascript:alert(1)', 'file:///C:/Windows', 'http://public.example/'])
      expect(() => externalUrl(url)).toThrow();
    expect(() => assetPath('C:\\app\\dist', '/..%2Fsecret')).toThrow();
    expect(() => assetPath('C:\\app\\dist', '/..\\secret')).toThrow();
  });
});
