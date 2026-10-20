import { Link } from 'react-router-dom';
import { ArrowUpRight, Users, CalendarRange, CircleCheck, UserRound, Clock3 } from 'lucide-react';
import { asRows, row, type Row } from '../../lib/types';
import { can } from '../../stores/auth';
import { t } from '../../lib/i18n';

export const portfolioGroups = [
  {
    value: '',
    key: 'ALL',
    label: 'All members',
    icon: Users,
    description: 'Every member in this project',
  },
  {
    value: 'INSTALLMENTS',
    key: 'INSTALLMENTS',
    label: 'Installments',
    icon: CalendarRange,
    description: 'Confirmed installment bookings with a balance',
  },
  {
    value: 'FULLY_PAID',
    key: 'FULLY_PAID',
    label: 'Fully paid',
    icon: CircleCheck,
    description: 'All current bookings confirmed and fully paid',
  },
  {
    value: 'UNASSIGNED',
    key: 'UNASSIGNED',
    label: 'No property',
    icon: UserRound,
    description: 'No current booking or property ownership',
  },
  {
    value: 'PENDING',
    key: 'PENDING',
    label: 'Pending',
    icon: Clock3,
    description: 'Awaiting booking confirmation or full payment',
  },
];

export function PaymentStatus({ value }: { value: unknown }) {
  const group = portfolioGroups.find((g) => g.value === value);
  return group ? (
    <span className="portfolio-status" data-status={value} title={t(group.description)}>
      <group.icon size={13} />
      {t(group.label)}
    </span>
  ) : (
    <span className="muted">—</span>
  );
}

export function PortfolioLinks({ record, kind }: { record: Row; kind: 'customers' | 'inventory' }) {
  if (!Array.isArray(record.bookings)) return <span className="muted">—</span>;
  const bookings = asRows(record.bookings);
  if (!bookings.length)
    return (
      <span className="muted">
        {t(kind === 'customers' ? 'No property assigned' : 'No current booking')}
      </span>
    );
  return (
    <div className="portfolio-links">
      {bookings.map((booking) => (
        <div key={booking.id} className="portfolio-relation">
          {kind === 'customers' ? (
            can('inventory.read') && row(booking.unit).id ? (
              <Link className="record-link" to={'/inventory?record=' + row(booking.unit).id}>
                {t('Property')} {String(row(booking.unit).number)}
                <ArrowUpRight size={13} />
              </Link>
            ) : (
              <span>{String(booking.reference)}</span>
            )
          ) : (
            asRows(booking.customers).map((customer) => (
              <Link className="record-link" key={customer.id} to={'/customers/' + customer.id}>
                {String(customer.name)}
                <ArrowUpRight size={13} />
              </Link>
            ))
          )}
          <small className="portfolio-booking-state" data-status={booking.status}>
            <i />
            {t(booking.status === 'CONFIRMED' ? 'Confirmed booking' : 'Pending booking')}
            {kind === 'customers' && <PaymentStatus value={booking.paymentStatus} />}
          </small>
        </div>
      ))}
    </div>
  );
}

export function CustomerGroups({
  selected,
  groups,
  busy,
  onChange,
}: {
  selected: string;
  groups: Row;
  busy: boolean;
  onChange: (value: string) => void;
}) {
  const active = portfolioGroups.find((g) => g.value === selected) ?? portfolioGroups[0]!;
  return (
    <div className="portfolio-filter">
      <div className="portfolio-groups" aria-label={t('Member groups')}>
        {portfolioGroups.map((group) => (
          <button
            key={group.key}
            aria-pressed={selected === group.value}
            onClick={() => onChange(group.value)}
            title={t(group.description)}
          >
            <span>
              <group.icon size={17} />
              {t(group.label)}
            </span>
            <strong>{busy ? '…' : Number(groups[group.key] ?? 0).toLocaleString()}</strong>
          </button>
        ))}
      </div>
      <p className="muted">
        {t(active.description)}. {t('Counts follow your search.')}
      </p>
    </div>
  );
}
