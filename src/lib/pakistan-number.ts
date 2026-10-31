import Decimal from 'decimal.js';
import { t } from './i18n';
export function pakistanAmount(value: unknown): string {
  try {
    const amount = new Decimal(String(value).replaceAll(',', ''));
    if (!amount.isFinite()) return '';
    const rounded = amount.abs().toDecimalPlaces(2);
    let whole = BigInt(rounded.floor().toFixed(0));
    const parts: string[] = [];
    for (const [divisor, label] of [
      [10000000n, 'crore'],
      [100000n, 'lac'],
      [1000n, 'thousand'],
      [100n, 'hundred'],
    ] as const) {
      const count = whole / divisor;
      if (count) parts.push(`${count.toLocaleString('en-US')} ${t(label)}`);
      whole %= divisor;
    }
    if (whole) parts.push(String(whole));
    if (!parts.length) parts.push('0');
    const fraction = rounded.minus(rounded.floor()).mul(100).round();
    if (fraction.gt(0)) parts.push(`${fraction.toFixed(0)}/100`);
    return (amount.isNegative() && !rounded.isZero() ? '−' : '') + parts.join(' ');
  } catch {
    return '';
  }
}
