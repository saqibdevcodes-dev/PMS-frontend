import { t, useLocale } from '../../lib/i18n';
import Decimal from 'decimal.js';
import { Select } from '../../components/Select';
import { MoneyInput } from '../../components/MoneyInput';
import { money, calendarDay } from '../../lib/format';

export type Terms = {
  paymentType: 'FULL_PAYMENT' | 'INSTALLMENTS';
  downPayment: string;
  installmentCount: number;
  intervalMonths: number;
  firstInstallmentDate: string;
};
export const initialTerms = (): Terms => ({
  paymentType: 'FULL_PAYMENT',
  downPayment: '',
  installmentCount: 12,
  intervalMonths: 1,
  firstInstallmentDate: calendarDay(new Date()),
});
export function previewPlan(total: Decimal, terms: Terms) {
  if (terms.paymentType === 'FULL_PAYMENT') return [];
  const balance = total.minus(terms.downPayment || 0);
  if (
    !balance.gt(0) ||
    terms.installmentCount < 1 ||
    terms.installmentCount > 360 ||
    !Number.isInteger(terms.installmentCount) ||
    !terms.firstInstallmentDate
  )
    return [];
  const start = new Date(terms.firstInstallmentDate + 'T00:00:00Z');
  if (Number.isNaN(start.getTime())) return [];
  const each = balance.div(terms.installmentCount).toDecimalPlaces(2, Decimal.ROUND_DOWN);
  return Array.from({ length: terms.installmentCount }, (_, i) => {
    const date = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i * terms.intervalMonths + 1, 0),
    );
    date.setUTCDate(Math.min(start.getUTCDate(), date.getUTCDate()));
    return {
      label: `Installment ${i + 1}`,
      dueDate: date.toISOString().slice(0, 10),
      amount: (i === terms.installmentCount - 1 ? balance.minus(each.mul(i)) : each).toFixed(2),
    };
  });
}
export function PaymentFields({
  value,
  onChange,
  total,
  minimum = '0',
}: {
  value: Terms;
  onChange: (v: Terms) => void;
  total: Decimal;
  minimum?: string;
}) {
  useLocale();
  const update = (part: Partial<Terms>) => onChange({ ...value, ...part });
  const schedule = previewPlan(total, value);
  return (
    <>
      <label className="form-field form-full">
        How will the customer pay?
        <Select
          value={value.paymentType}
          onChange={(v) => update({ paymentType: v as Terms['paymentType'] })}
          options={[
            { value: 'FULL_PAYMENT', label: 'Full Payment' },
            { value: 'INSTALLMENTS', label: 'Installment Plan' },
          ]}
        />
      </label>
      {value.paymentType === 'FULL_PAYMENT' ? (
        <div className="review-notice form-full">
          <div>
            <strong>Full payment: {money(total)}</strong>
            <p>Record the payment after confirming the booking. No installment setup is needed.</p>
          </div>
        </div>
      ) : (
        <>
          <label className="form-field">
            {t('Down payment')}
            <MoneyInput
              aria-label="Down payment"
              min="0"
              step="0.01"
              value={value.downPayment}
              onValueChange={(downPayment) => update({ downPayment })}
            />
            <small>Project minimum: {money(minimum)}. This rule is set in Project settings.</small>
          </label>
          <label className="form-field">
            {t('Number of installments')}
            <input
              type="number"
              min="1"
              max="360"
              step="1"
              value={value.installmentCount || ''}
              onChange={(e) => update({ installmentCount: Number(e.target.value) })}
            />
          </label>
          <label className="form-field">
            Payment frequency
            <Select
              value={String(value.intervalMonths)}
              onChange={(v) => update({ intervalMonths: Number(v) })}
              options={[
                { value: '1', label: 'Monthly' },
                { value: '3', label: 'Quarterly' },
                { value: '6', label: 'Every 6 months' },
                { value: '12', label: 'Yearly' },
              ]}
            />
          </label>
          <label className="form-field">
            {t('First installment date')}
            <input
              type="date"
              value={value.firstInstallmentDate}
              onChange={(e) => update({ firstInstallmentDate: e.target.value })}
            />
          </label>
          <div className="form-full">
            <p className="payment-equation">
              Payable amount {money(total)} − down payment {money(value.downPayment || 0)} =
              remaining balance <strong>{money(total.minus(value.downPayment || 0))}</strong>
            </p>
            <p className="muted">
              The payable amount includes any discount. The last installment includes any rounding
              difference.
            </p>
            <div className="schedule-preview">
              <table>
                <caption>Payment schedule preview</caption>
                <thead>
                  <tr>
                    <th>{t('Payment')}</th>
                    <th>{t('Due date')}</th>
                    <th>{t('Amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((r) => (
                    <tr key={r.label}>
                      <td>{r.label}</td>
                      <td>{r.dueDate}</td>
                      <td>{money(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
