import Decimal from 'decimal.js';
import { t } from './i18n';
export function pakistanAmount(value: unknown): string {
  try {
    const amount = new Decimal(String(value).replaceAll(',', ''));
    if (!amount.isFinite()) return '';
    let whole = BigInt(amount.abs().floor().toFixed(0));
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
    const fraction = amount.abs().minus(amount.abs().floor()).mul(100).round();
    if (fraction.gt(0)) parts.push(`${fraction.toFixed(0)}/100`);
    return (amount.isNegative() ? '−' : '') + parts.join(' ');
  } catch {
    return '';
  }
}
