import Decimal from 'decimal.js';
import { usePreferences } from '../stores/preferences';
export function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\bId\b/g, 'ID')
    .toLowerCase()
    .replace(/^./, (s) => s.toUpperCase());
}
export function money(
  value: unknown,
  currency = usePreferences.getState().currency,
  compact = false,
) {
  try {
    const n = new Decimal(String(value ?? 0));
    if (compact && n.abs().gte(1000000)) return `${currency} ${n.div(1000000).toFixed(2)}m`;
    if (compact && n.abs().gte(1000)) return `${currency} ${n.div(1000).toFixed(1)}k`;
    const [whole, cents] = n.toFixed(2).split('.');
    return `${currency} ${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${cents}`;
  } catch {
    return '—';
  }
}
export function date(value: unknown) {
  if (!value) return '—';
  const d = new Date(String(value));
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: /^\d{4}-\d{2}-\d{2}$/.test(String(value))
          ? 'UTC'
          : usePreferences.getState().timezone,
      }).format(d);
}
export function calendarDay(value: Date, timezone = usePreferences.getState().timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  return ['year', 'month', 'day']
    .map((name) => parts.find((p) => p.type === name)!.value)
    .join('-');
}
export const shortId = (id: unknown) =>
  typeof id === 'string' ? id.slice(0, 8).toUpperCase() : '—';
export const labelOf = (record: Record<string, unknown>) =>
  String(
    record.name ??
      record.reference ??
      record.number ??
      record.title ??
      record.code ??
      shortId(record.id),
  );
export const moneyFields =
  /^(price|charges|amount|total|discount|deduction|refundable|debit|credit|balance|paid|outstanding|overdue|collected|unallocated|downPayment|netSales|verifiedCollections|commission|promiseAmount|netIncome|assets|liabilities|equity)$/i;
