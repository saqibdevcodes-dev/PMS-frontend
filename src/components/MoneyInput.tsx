import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { NumericFormat } from 'react-number-format';
import { pakistanAmount } from '../lib/pakistan-number';
import { usePreferences } from '../stores/preferences';
import { useLocale } from '../lib/i18n';
type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type'
> & {
  value: string;
  onValueChange: (value: string) => void;
};
export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { value, onValueChange, ...props },
  ref,
) {
  useLocale();
  const currency = usePreferences((state) => state.currency);
  const help = useId();
  return (
    <div className="money-input">
      <NumericFormat
        {...props}
        getInputRef={ref}
        type="text"
        inputMode="decimal"
        value={value}
        valueIsNumericString
        thousandSeparator=","
        decimalScale={2}
        allowNegative={false}
        isAllowed={({ value: next }) => next.replace('.', '').length <= 18}
        onValueChange={(values, source) => {
          if (source.source === 'event') onValueChange(values.value);
        }}
        aria-describedby={[props['aria-describedby'], help].filter(Boolean).join(' ')}
      />
      <small id={help} className="amount-words" aria-live="polite">
        {value ? `${pakistanAmount(value)} ${currency}` : ''}
      </small>
    </div>
  );
});
