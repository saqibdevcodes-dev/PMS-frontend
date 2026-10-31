import { useLocale } from '../lib/i18n';
import { amountInWords, money } from '../lib/format';
import { usePreferences } from '../stores/preferences';

/** A monetary value with the same readable wording used by MoneyInput. */
export function Money({
  value,
  currency,
  compact = false,
  showCurrency = true,
}: {
  value: unknown;
  currency?: string;
  compact?: boolean;
  showCurrency?: boolean;
}) {
  useLocale();
  const projectCurrency = usePreferences((state) => state.currency);
  const code = currency ?? projectCurrency;
  const words = amountInWords(value ?? 0, code);
  return (
    <span className="amount-display">
      <span className="amount-number">
        {money(value, showCurrency ? code : '', compact).trim()}
      </span>
      {words && <span className="amount-words">{words}</span>}
    </span>
  );
}
