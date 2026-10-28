import Decimal from 'decimal.js';
import { useFormContext, useWatch } from 'react-hook-form';
import { t } from '../lib/i18n';
import { money } from '../lib/format';

export function PurchaseCostSummary() {
  const { control } = useFormContext();
  const values = useWatch({
    control,
    name: ['price', 'taxes', 'legalFees', 'brokerage', 'otherCosts'],
  });
  const amounts = values.map((value) => {
    try {
      return new Decimal(String(value || 0));
    } catch {
      return new Decimal(0);
    }
  });
  const extras = amounts.slice(1).reduce((total, value) => total.plus(value), new Decimal(0));
  return (
    <section className="purchase-cost-summary form-full" aria-label={t('Acquisition cost summary')}>
      <div>
        <span>{t('Purchase price')}</span>
        <strong>{money(amounts[0])}</strong>
      </div>
      <div>
        <span>{t('Additional acquisition costs')}</span>
        <strong>{money(extras)}</strong>
      </div>
      <div>
        <span>{t('Total acquisition cost')}</span>
        <strong>{money(extras.plus(amounts[0]!))}</strong>
      </div>
    </section>
  );
}
