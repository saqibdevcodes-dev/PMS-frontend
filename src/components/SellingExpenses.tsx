import { Money } from './Money';
import { t, useLocale } from '../lib/i18n';
import '../features/bookings/booking-expenses.css';

export type SellingExpenseItem = {
  id?: string;
  name: string;
  amount: string;
};

export function SellingExpenses({
  items,
  total,
  currency,
}: {
  items: SellingExpenseItem[];
  total: string;
  currency?: string;
}) {
  useLocale();
  if (!items.length) return null;
  return (
    <section className="selling-expenses-detail">
      <h4>{t('Selling expenses')}</h4>
      <ul>
        {items.map((item, index) => (
          <li key={item.id ?? index}>
            <span>{item.name}</span>
            <strong>
              <Money value={item.amount} currency={currency} />
            </strong>
          </li>
        ))}
      </ul>
      <div className="selling-expenses-detail-total">
        <span>{t('Selling expense subtotal')}</span>
        <strong>
          <Money value={total} currency={currency} />
        </strong>
      </div>
    </section>
  );
}
