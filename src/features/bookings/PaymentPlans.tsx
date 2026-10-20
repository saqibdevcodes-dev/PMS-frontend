import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import { api } from '../../lib/api';
import { asRows, row, type Row } from '../../lib/types';
import { money, date, humanize } from '../../lib/format';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { queryClient } from '../../lib/query';
import { RelationSelect } from '../../components/RelationSelect';
import { Select } from '../../components/Select';
import { DataTable } from '../../components/DataTable';
import { Button, PageHeading, ErrorState, Skeleton, EmptyState, Badge } from '../../components/ui';
import { Wallet, CalendarRange, CircleCheck, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import { previewPlan, initialTerms } from './PaymentFields';
import { useUnsavedChanges } from '../../hooks/use-unsaved';
import CollectInstallment from './CollectInstallment';

export default function PaymentPlans() {
  const projectId = usePreferences((s) => s.projectId);
  const [params] = useSearchParams();
  return <PaymentPlanWorkspace key={projectId + ':' + (params.get('booking') ?? '')} />;
}

function PaymentPlanWorkspace() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [params, setParams] = useSearchParams();
  const bookingId = params.get('booking') ?? '';
  const [collect, setCollect] = useState<Row | null>(null);
  const [count, setCount] = useState(12),
    [interval, setInterval] = useState('1'),
    [first, setFirst] = useState(initialTerms().firstInstallmentDate),
    [reason, setReason] = useState(''),
    [editing, setEditing] = useState(false);
  useUnsavedChanges(editing);
  const booking = useQuery({
    queryKey: ['payment-plan-booking', projectId, bookingId],
    enabled: !!projectId && !!bookingId && can('bookings.read'),
    queryFn: () => api<Row>(`/projects/${projectId}/bookings/${bookingId}`),
  });
  const position = row(booking.data?.position),
    installments = asRows(position.installments);
  const unpaid = installments.filter((r) => new Decimal(String(r.paid ?? 0)).eq(0));
  const balance = unpaid.reduce((a, r) => a.plus(String(r.amount)), new Decimal(0));
  const total = new Decimal(String(booking.data?.total ?? 0));
  const collected = new Decimal(String(position.collected ?? 0));
  const progress = total.gt(0)
    ? Decimal.min(100, Decimal.max(0, collected.div(total).mul(100))).toNumber()
    : 0;
  const nextDue = installments.find((r) => new Decimal(String(r.outstanding ?? 0)).gt(0));
  const preview = previewPlan(balance, {
    paymentType: 'INSTALLMENTS',
    downPayment: '0',
    installmentCount: count,
    intervalMonths: Number(interval),
    firstInstallmentDate: first,
  });
  const save = useMutation({
    mutationFn: () =>
      api(`/projects/${projectId}/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        body: {
          installmentCount: count,
          intervalMonths: Number(interval),
          firstInstallmentDate: first,
          reason,
        },
      }),
    onSuccess: () => {
      setEditing(false);
      setReason('');
      void queryClient.invalidateQueries();
    },
  });
  if (!can('bookings.read')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  return (
    <>
      <PageHeading
        title="Payment plans"
        description="Choose Full Payment or Installment Plan when creating a booking. Manage the remaining payments here."
        actions={
          can('bookings.create') ? (
            <Button asChild>
              <Link to="/bookings/new">Create booking</Link>
            </Button>
          ) : undefined
        }
      />
      <section className="payment-workspace">
        <div className="panel payment-selector-card">
          <span className="workspace-icon">
            <CalendarRange size={24} />
          </span>
          <label className="form-field">
            {t('Booking')}
            <RelationSelect
              name="bookingId"
              value={bookingId}
              onChange={(id) => {
                setParams({ booking: id });
                setEditing(false);
                setReason('');
                setCount(12);
                setInterval('1');
                setFirst(initialTerms().firstInstallmentDate);
                save.reset();
              }}
            />
          </label>
        </div>
        {booking.error && <ErrorState error={booking.error} />}
        {bookingId && booking.isPending && (
          <div className="panel payment-overview">
            <Skeleton rows={5} />
          </div>
        )}
        {!bookingId && (
          <div className="panel">
            <EmptyState
              title="Choose a booking to get started"
              description="View its payment progress, upcoming installments and remaining balance in one place."
            />
          </div>
        )}
        {booking.data && (
          <>
            <section className="panel payment-overview">
              <header className="payment-overview-heading">
                <div>
                  <span className="workspace-eyebrow">
                    {booking.data.paymentType === 'FULL_PAYMENT'
                      ? t('Full Payment')
                      : t('Installment Plan')}
                  </span>
                  <h2>{String(booking.data.reference)}</h2>
                  <p>
                    <strong>{String(row(booking.data.customer).name)}</strong>
                    {row(booking.data.customer).fatherName
                      ? ` (S/O ${String(row(booking.data.customer).fatherName)})`
                      : ''}
                    {' · '}
                    {t('Property')} {String(row(booking.data.unit).number)}
                    {row(booking.data.unit).type
                      ? ` (${humanize(String(row(booking.data.unit).type))})`
                      : ''}
                    {row(booking.data.customer).phone
                      ? ` · ${String(row(booking.data.customer).phone)}`
                      : ''}
                  </p>
                </div>
                <Badge value={booking.data.status} />
              </header>
              <dl className="payment-metrics">
                <div>
                  <dt>
                    <Wallet size={16} />
                    {t('Total price')}
                  </dt>
                  <dd>{money(booking.data.total)}</dd>
                </div>
                <div>
                  <dt>
                    <CircleCheck size={16} />
                    {t('Verified payments')}
                  </dt>
                  <dd>{money(position.collected)}</dd>
                </div>
                <div>
                  <dt>
                    <CalendarRange size={16} />
                    {t('Remaining balance')}
                  </dt>
                  <dd>{money(position.outstanding)}</dd>
                </div>
              </dl>
              <div className="payment-progress-label">
                <span>{t('Payment progress')}</span>
                <strong>{t('{percent}% paid', { percent: progress.toFixed(1) })}</strong>
              </div>
              <progress
                className="payment-progress"
                value={progress}
                max={100}
                aria-label={t('Payment progress')}
              />
            </section>
            <div className="payment-layout">
              <section className="panel payment-schedule-card">
                <header className="workspace-card-heading">
                  <div>
                    <h2>{t('Payment schedule')}</h2>
                    <p>
                      {installments.length} {installments.length === 1 ? 'payment' : 'payments'} ·{' '}
                      {t('Verified payments update this schedule automatically.')}
                    </p>
                  </div>
                </header>
                <DataTable
                  data={installments}
                  columns={['label', 'dueDate', 'amount', 'paid', 'outstanding']}
                  controls={false}
                  actions={(item) =>
                    Number(item.outstanding) <= 0 ? (
                      <Badge value="PAID" />
                    ) : item.id === nextDue?.id &&
                      booking.data?.status === 'CONFIRMED' &&
                      can('payments.create') ? (
                      <Button size="small" onClick={() => setCollect(item)}>
                        {t('Receive installment')}
                      </Button>
                    ) : (
                      <small className="muted">{t('Earlier installment first')}</small>
                    )
                  }
                />
                {can('payments.read') && (
                  <footer className="payment-schedule-footer">
                    <Button asChild variant="secondary">
                      <Link to={'/collections?bookingId=' + bookingId}>
                        {t('Record & view payments')}
                      </Link>
                    </Button>
                  </footer>
                )}
              </section>
              <aside className="panel payment-next-card">
                <span className="workspace-icon">
                  <CalendarRange size={23} />
                </span>
                <h2>{t(nextDue ? 'Next payment' : 'Schedule complete')}</h2>
                {nextDue ? (
                  <>
                    <strong className="next-payment-amount">{money(nextDue.outstanding)}</strong>
                    <p>
                      {String(nextDue.label)} · {date(nextDue.dueDate)}
                    </p>
                  </>
                ) : (
                  <p>{t('There are no outstanding scheduled payments.')}</p>
                )}
                {can('bookings.read') && (
                  <Link className="text-link" to={'/bookings?record=' + bookingId}>
                    {t('View booking')}
                    <ArrowUpRight size={14} />
                  </Link>
                )}
                <div className="payment-rule-note">
                  <ShieldCheck size={18} />
                  <div>
                    {booking.data.paymentType === 'FULL_PAYMENT' ? (
                      <p>
                        A single full payment is due. A receipt is issued when the payment is
                        verified.
                      </p>
                    ) : (
                      <>
                        <p>
                          <strong>
                            {t('Down payment')}: {money(booking.data.downPayment)}
                          </strong>
                          {t(
                            collected.lt(String(booking.data.downPayment))
                              ? 'Record and verify the down payment to unlock schedule changes.'
                              : 'You can change the remaining unpaid installments.',
                          )}{' '}
                          {t('Paid and partly paid installments are always kept.')}
                        </p>
                        {can('bookings.approve') &&
                          !editing &&
                          booking.data.status !== 'CANCELLED' && (
                            <Button
                              disabled={
                                !balance.gt(0) ||
                                new Decimal(String(position.collected ?? 0)).lt(
                                  String(booking.data.downPayment),
                                )
                              }
                              onClick={() => setEditing(true)}
                            >
                              {t('Change remaining installments')}
                            </Button>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
        {editing && (
          <form
            className="panel payment-edit-card"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <header className="workspace-card-heading">
              <div>
                <span className="workspace-eyebrow">{t('Payment plan')}</span>
                <h2>{t('Change remaining installments')}</h2>
                <p>{t('Review the new dates and amounts before saving.')}</p>
              </div>
            </header>
            <div className="form-grid">
              <label className="form-field">
                {t('Number of installments')}
                <input
                  required
                  type="number"
                  min="1"
                  max="360"
                  value={count || ''}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </label>
              <label className="form-field">
                Payment frequency
                <Select
                  value={interval}
                  onChange={setInterval}
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
                  required
                  type="date"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                />
              </label>
              <label className="form-field">
                Reason for change
                <input
                  required
                  minLength={3}
                  maxLength={1000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            </div>
            <h3>Schedule preview · {money(balance)}</h3>
            <DataTable data={preview} columns={['label', 'dueDate', 'amount']} controls={false} />
            {save.error && <ErrorState error={save.error} />}
            <div className="form-footer">
              <Button
                type="button"
                variant="secondary"
                disabled={save.isPending}
                onClick={() => setEditing(false)}
              >
                {t('Cancel')}
              </Button>
              <Button type="submit" busy={save.isPending} disabled={!preview.length}>
                Save Payment Plan
              </Button>
            </div>
          </form>
        )}
      </section>
      {collect && (
        <CollectInstallment
          installment={collect}
          bookingId={bookingId}
          onClose={() => setCollect(null)}
        />
      )}
    </>
  );
}
