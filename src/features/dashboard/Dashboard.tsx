import { t, useLocale } from '../../lib/i18n';
import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import {
  ArrowUpRight,
  Building2,
  Wallet,
  CircleDollarSign,
  CalendarDays,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock3,
  ShieldCheck,
  ChartNoAxesCombined,
} from 'lucide-react';
import { api, queryString } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { useAuth, can } from '../../stores/auth';
import { asRows, row, type Row } from '../../lib/types';
import { date, humanize, money, calendarDay } from '../../lib/format';
import { Button, PageHeading, EmptyState, ErrorState, Skeleton, Badge } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
const CollectionChart = lazy(() =>
  import('./Charts').then((m) => ({ default: m.CollectionChart })),
);
const InventoryChart = lazy(() => import('./Charts').then((m) => ({ default: m.InventoryChart })));
const AgeingChart = lazy(() => import('./Charts').then((m) => ({ default: m.AgeingChart })));
const colors = [
  '#4168e8',
  '#8babfc',
  '#33ad8b',
  '#edb559',
  '#91a0b7',
  '#b499d5',
  '#f18c85',
  '#7086ac',
];
export default function Dashboard() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const projectName = usePreferences((s) => s.projectName);
  const user = useAuth((s) => s.user)!;
  const navigate = useNavigate();
  const [phase, setPhase] = useState('');
  const [days, setDays] = useState(30);
  const to = calendarDay(new Date());
  const from = new Date(Date.parse(to + 'T00:00:00Z') - (days - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  const root = `/projects/${projectId}`;
  const summary = useQuery({
    queryKey: ['dashboard', projectId, phase],
    enabled: !!projectId && can('reports.read'),
    queryFn: ({ signal }) => api<Row>(root + '/dashboard' + queryString({ phase }), { signal }),
  });
  const collections = useQuery({
    queryKey: ['dashboard-collections', projectId, from, to, phase],
    enabled: !!projectId && can('reports.read'),
    queryFn: ({ signal }) =>
      api<Row>(root + '/reports' + queryString({ kind: 'collections', from, to, phase }), {
        signal,
      }),
  });
  const ageing = useQuery({
    queryKey: ['dashboard-ageing', projectId, phase],
    enabled: !!projectId && can('reports.read'),
    queryFn: ({ signal }) =>
      api<Row>(root + '/reports' + queryString({ kind: 'ageing', phase }), { signal }),
  });
  const bookings = useQuery({
    queryKey: ['dashboard-bookings', projectId],
    enabled: !!projectId && can('bookings.read'),
    queryFn: ({ signal }) => api(root + '/bookings?limit=5', { signal }),
  });
  const approvals = useQuery({
    queryKey: ['dashboard-approvals', projectId],
    enabled: !!projectId && can('approvals.read'),
    queryFn: ({ signal }) => api(root + '/approvals?limit=10', { signal }),
  });
  if (!can('reports.read'))
    return (
      <>
        <PageHeading
          title={t('Welcome, {0}', { '0': user.name.split(' ')[0] })}
          description={t('Your workspace is ready.')}
        />
        <Button asChild>
          <Link to="/my-work">
            {t('Open my work')}
            <ArrowRight size={16} />
          </Link>
        </Button>
        <Unauthorized />
      </>
    );
  if (!projectId) return <ProjectRequired />;
  const s = summary.data ?? {};
  const currency = String(s.currency ?? 'PKR');
  const inventory = Object.entries(row(s.inventory)).map(([name, value]) => ({
    name: humanize(name),
    value: Number(value),
  }));
  const payments = asRows(collections.data?.rows);
  const trend = Array.from({ length: days }, (_, i) => {
    const day = new Date(Date.parse(to + 'T00:00:00Z') - (days - 1 - i) * 86400000)
      .toISOString()
      .slice(0, 10);
    return {
      label: date(day).slice(0, 6),
      amount: payments
        .filter((p) => calendarDay(new Date(String(p.paidAt))) === day)
        .reduce((acc, p) => acc.plus(String(p.amount)), new Decimal(0))
        .toNumber(),
    };
  });
  const overdueRows = asRows(ageing.data?.rows);
  const buckets = [...new Set(overdueRows.map((r) => String(r.bucket)))].sort(
    (a, b) => parseInt(a) - parseInt(b),
  );
  const ageingData = buckets.map((bucket) => ({
    label: bucket.endsWith('+')
      ? t('{count} days', { count: bucket })
      : t('Up to {count} days', { count: bucket }),
    amount: overdueRows
      .filter((r) => r.bucket === bucket)
      .reduce((acc, r) => acc.plus(String(r.outstanding)), new Decimal(0))
      .toNumber(),
  }));
  const pending = asRows(approvals.data)
    .filter((a) => a.status === 'PENDING')
    .slice(0, 3);
  const cards = [
    {
      label: 'Total inventory',
      value: Number(s.totalInventory ?? 0).toLocaleString(),
      note: t('{count} properties available', {
        count: s.inventory ? String(row(s.inventory).AVAILABLE ?? 0) : '0',
      }),
      icon: Building2,
      url: '/inventory',
      tone: 'blue',
    },
    {
      label: 'Net sales value',
      value: money(s.netSales, currency, true),
      note: t('{count} confirmed bookings', { count: s.confirmedBookings ?? 0 }),
      icon: ChartNoAxesCombined,
      url: '/bookings?status=CONFIRMED',
      tone: 'violet',
    },
    {
      label: 'Verified collections',
      value: money(s.verifiedCollections, currency, true),
      note: 'Cleared payments · all time',
      icon: Wallet,
      url: '/collections?status=CLEARED',
      tone: 'green',
    },
    {
      label: 'Outstanding dues',
      value: money(s.outstanding, currency, true),
      note: t('{amount} overdue', { amount: money(s.overdue, currency, true) }),
      icon: CircleDollarSign,
      url: '/reports?kind=outstanding',
      tone: 'amber',
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow={t('{0} / MANAGEMENT OVERVIEW', { '0': projectName })}
        title={t('Portfolio overview')}
        description={t('Hello, {name}. Here is your project summary.', {
          name: user.name.split(' ')[0],
        })}
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label={t('Refresh dashboard')}
              onClick={() =>
                void Promise.all([
                  summary.refetch(),
                  collections.refetch(),
                  ageing.refetch(),
                  bookings.refetch(),
                  approvals.refetch(),
                ])
              }
            >
              <RefreshCw size={16} />
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/reports">
                <ArrowUpRight size={16} />
                {t('View reports')}
              </Link>
            </Button>
            {can('bookings.create') && (
              <Button asChild>
                <Link to="/bookings/new">
                  <Plus size={17} />
                  {t('New booking')}
                </Link>
              </Button>
            )}
          </>
        }
      />
      <div className="dashboard-context">
        <div>
          <span className="live-dot" />
          <span>{t('Current portfolio position')}</span>
          <span className="context-divider" />
          <span>{date(new Date().toISOString())}</span>
        </div>
        <div className="input-icon phase-input">
          <Building2 size={14} />
          <input
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            placeholder={t('All phases')}
            aria-label={t('Filter dashboard by phase')}
          />
        </div>
      </div>
      {summary.isError ? (
        <ErrorState error={summary.error} retry={() => void summary.refetch()} />
      ) : (
        <div className="kpi-grid">
          {cards.map((card) => (
            <button className="kpi-card" key={t(card.label)} onClick={() => navigate(card.url)}>
              <div className="kpi-top">
                <span>{t(card.label)}</span>
                <span className={'kpi-icon ' + card.tone}>
                  <card.icon size={18} />
                </span>
              </div>
              {summary.isLoading ? (
                <span className="skeleton kpi-skeleton" />
              ) : (
                <strong>{card.value}</strong>
              )}
              <div className="kpi-bottom">
                <span>{t(card.note)}</span>
                <ArrowUpRight size={14} />
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="dashboard-main-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>{t('Collection activity')}</h2>
              <p>{t('Verified funds received during the selected period')}</p>
            </div>
            <select
              aria-label={t('Collection chart period')}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>{t('Last 7 days')}</option>
              <option value={30}>{t('Last 30 days')}</option>
              <option value={90}>{t('Last 90 days')}</option>
            </select>
          </div>
          <div className="chart-summary">
            <strong>
              {money(
                payments.reduce((a, p) => a.plus(String(p.amount)), new Decimal(0)).toFixed(2),
                currency,
              )}
            </strong>
            <span>
              <span className="legend-dot" style={{ background: '#4168e8' }} />
              {t('Cleared collections')}
            </span>
          </div>
          {collections.isError ? (
            <ErrorState error={collections.error} />
          ) : collections.isLoading ? (
            <Skeleton rows={3} />
          ) : (
            <Suspense fallback={<Skeleton rows={3} />}>
              <CollectionChart data={trend} currency={currency} />
            </Suspense>
          )}
          <footer className="chart-foot">
            <span>
              <CalendarDays size={13} />
              {date(from)} — {date(to)}
            </span>
            <Link to="/reports?kind=collections">
              {t('Explore collections')}
              <ArrowRight size={13} />
            </Link>
          </footer>
        </section>
        <section className="panel inventory-panel">
          <div className="panel-heading">
            <div>
              <h2>{t('Inventory mix')}</h2>
              <p>{t('Every unit, accounted for')}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('Open inventory')}
              onClick={() => navigate('/inventory')}
            >
              <ArrowUpRight size={17} />
            </Button>
          </div>
          <div className="donut-wrap">
            {inventory.length ? (
              <Suspense fallback={<Skeleton rows={2} />}>
                <InventoryChart data={inventory} />
              </Suspense>
            ) : (
              <div className="empty-donut" />
            )}
            <div className="donut-center">
              <strong>{String(s.totalInventory ?? 0)}</strong>
              <span>{t('Total units')}</span>
            </div>
          </div>
          <div className="inventory-legend">
            {(inventory.length
              ? inventory
              : [
                  { name: 'Available', value: 0 },
                  { name: 'Reserved', value: 0 },
                  { name: 'Booked', value: 0 },
                  { name: 'Sold', value: 0 },
                ]
            ).map((v, i) => (
              <div key={v.name}>
                <span>
                  <i style={{ background: colors[i % colors.length] }} />
                  {t(v.name)}
                </span>
                <strong>{v.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-bottom-grid">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>{t('Recent bookings')}</h2>
              <p>{t('The latest activity across your project')}</p>
            </div>
            <Link className="text-link" to="/bookings">
              {t('View all')}
              <ArrowRight size={14} />
            </Link>
          </div>
          {bookings.isError ? (
            <ErrorState error={bookings.error} />
          ) : (
            <DataTable
              data={asRows(bookings.data)}
              columns={['reference', 'total', 'status', 'createdAt']}
              controls={false}
              currency={currency}
              busy={bookings.isLoading}
              onRow={(r) => navigate('/bookings?record=' + r.id)}
              empty={
                <EmptyState
                  compact
                  title={t('Your first booking is ahead')}
                  description={t('Bookings will appear here once a reservation is converted.')}
                />
              }
            />
          )}
        </section>
        <section className="panel work-panel">
          <div className="panel-heading">
            <div>
              <h2>{t('Needs attention')}</h2>
              <p>{t('Your next decisions, in one place')}</p>
            </div>
            <ShieldCheck size={18} />
          </div>
          <Link to="/approvals" className="attention-item">
            <span className="attention-icon violet">
              <ShieldCheck size={19} />
            </span>
            <span>
              <strong>{t('Pending approvals')}</strong>
              <small>{t("Keep your team's work moving")}</small>
            </span>
            <b>{String(s.pendingApprovals ?? 0)}</b>
            <ArrowUpRight size={15} />
          </Link>
          <Link to="/reports?kind=ageing" className="attention-item">
            <span className="attention-icon amber">
              <Clock3 size={19} />
            </span>
            <span>
              <strong>{t('Customers overdue')}</strong>
              <small>{t('Follow up with your recovery team')}</small>
            </span>
            <b>{String(s.defaulterCount ?? 0)}</b>
            <ArrowUpRight size={15} />
          </Link>
          <Link to="/installments" className="attention-item">
            <span className="attention-icon blue">
              <CalendarDays size={19} />
            </span>
            <span>
              <strong>{t('Upcoming installments')}</strong>
              <small>{t('Current unpaid obligations')}</small>
            </span>
            <b>{String(s.upcomingInstallments ?? 0)}</b>
            <ArrowUpRight size={15} />
          </Link>
          {pending.length > 0 && (
            <div className="pending-list">
              {pending.map((a) => (
                <Link to={'/approvals?record=' + a.id} key={a.id}>
                  <span>{humanize(String(a.operation))}</span>
                  <Badge value={a.status} />
                </Link>
              ))}
            </div>
          )}
          <Link className="work-link" to="/my-work">
            {t('Open my work')}
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      {asRows(ageing.data?.rows).length > 0 && (
        <section className="panel ageing-panel">
          <div className="panel-heading">
            <div>
              <h2>{t('Outstanding dues ageing')}</h2>
              <p>{t('Overdue balances by project-local due date')}</p>
            </div>
          </div>
          <Suspense fallback={<Skeleton />}>
            <AgeingChart data={ageingData} currency={currency} />
          </Suspense>
        </section>
      )}
    </>
  );
}
