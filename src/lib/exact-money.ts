import Decimal from 'decimal.js';

export function exactMoney(value: unknown): Decimal {
  try {
    return new Decimal(String(value || '0'));
  } catch {
    return new Decimal(NaN);
  }
}
export function moneyPayload(value: unknown) {
  const amount = exactMoney(value);
  if (!amount.isFinite() || amount.lt(0) || amount.decimalPlaces() > 2)
    throw new Error('Enter a non-negative amount with at most two decimal places.');
  return amount.toFixed(2);
}
