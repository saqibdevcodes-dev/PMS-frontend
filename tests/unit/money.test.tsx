import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Money } from '../../src/components/Money';
import { MoneyInput } from '../../src/components/MoneyInput';
import { amountInWords, money, moneyFields, moneyWithWords } from '../../src/lib/format';
import { usePreferences } from '../../src/stores/preferences';

beforeEach(() => usePreferences.setState({ currency: 'PKR', language: 'en' }));
afterEach(cleanup);

it('keeps wording consistent with monetary rounding, including carries and negative zero', () => {
  expect(money('99.999')).toBe('PKR 100.00');
  expect(amountInWords('99.999')).toBe('1 hundred PKR');
  expect(amountInWords('-0.001')).toBe('0 PKR');
  expect(amountInWords('-125000.25')).toBe('−1 lac 25 thousand 25/100 PKR');
  expect(amountInWords('0.10', 'USD')).toBe('0 10/100 USD');
  expect(amountInWords('')).toBe('');
  expect(amountInWords('not-an-amount')).toBe('');
  expect(moneyWithWords('250000')).toBe('PKR 250,000.00 (2 lac 50 thousand PKR)');
});

it('displays exact large values with their wording and the supplied currency', () => {
  const { container } = render(<Money value="9007199254740993.25" currency="USD" />);
  expect(container.querySelector('.amount-number')?.textContent).toBe(
    'USD 9,007,199,254,740,993.25',
  );
  expect(container.querySelector('.amount-words')?.textContent).toBe(
    amountInWords('9007199254740993.25', 'USD'),
  );
  expect(container.querySelector('.amount-words')?.textContent).toContain('25/100 USD');
});

it('updates words as the user types, keeps decimal strings, and clears empty fields', () => {
  function Form() {
    const [value, setValue] = useState('');
    return <MoneyInput aria-label="Purchase price" value={value} onValueChange={setValue} />;
  }
  const { container } = render(<Form />);
  const input = screen.getByRole('textbox', { name: 'Purchase price' });
  fireEvent.change(input, { target: { value: '125000.25' } });
  expect((input as HTMLInputElement).value).toBe('125,000.25');
  expect(container.querySelector('.amount-words')?.textContent).toBe(
    '1 lac 25 thousand 25/100 PKR',
  );
  expect(input.getAttribute('aria-describedby')).toBe(container.querySelector('.amount-words')?.id);
  fireEvent.change(input, { target: { value: '' } });
  expect(container.querySelector('.amount-words')?.textContent).toBe('');
});

it('recognizes monetary fields without treating percentages and counts as currency', () => {
  for (const key of [
    'sellingPrice',
    'expectedAmount',
    'expectedTotal',
    'customRefundAmount',
    'totalCost',
  ])
    expect(moneyFields.test(key)).toBe(true);
  for (const key of ['downPaymentPercent', 'profitMarginPercent', 'installmentCount', 'size'])
    expect(moneyFields.test(key)).toBe(false);
});
