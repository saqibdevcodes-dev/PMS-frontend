import { t, useLocale } from '../../lib/i18n';
import { useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Building2,
  LayoutDashboard,
  House,
  CalendarClock,
  ReceiptText,
  Files,
  ListChecks,
  CircleUserRound,
  Bell,
  LogOut,
  Download,
  ArrowUpRight,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { date, money, humanize } from '../../lib/format';
import { useAuth } from '../../stores/auth';
import { logout } from '../../hooks/use-auth';
import { print, saveFile } from '../../platform/adapter';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  PageHeading,
  Skeleton,
} from '../../components/ui';
import type { Page } from '../../lib/types';
import Profile from '../admin/Profile';
import type {
  PortalBooking,
  PortalDashboard,
  PortalDocument,
  PortalInstallment,
  PortalNotice,
  PortalPayment,
  PortalProfile,
  PortalRequest,
  Position,
} from './types';
import './portal.css';

const navigation = [
  ['', 'Overview', LayoutDashboard],
  ['bookings', 'My properties', House],
  ['installments', 'Installments', CalendarClock],
  ['payments', 'Payments & receipts', ReceiptText],
  ['documents', 'Documents', Files],
  ['requests', 'Request status', ListChecks],
  ['notifications', 'Notifications', Bell],
  ['profile', 'My account', CircleUserRound],
] as const;

export default function Portal() {
  useLocale();
  const user = useAuth((s) => s.user)!;
  const [signingOut, setSigningOut] = useState(false);
  return (
    <div className="customer-portal">
      <header className="portal-header">
        <Link className="portal-brand" to="/portal">
          <span className="brand-mark">
            <Building2 size={24} />
          </span>
          <span>
            {t('estate')}
            <span className="blue">.</span>
            <small>{t('CUSTOMER PORTAL')}</small>
          </span>
        </Link>
        <div className="portal-user">
          <span>{user.name}</span>
          <Button
            variant="ghost"
            size="small"
            busy={signingOut}
            onClick={() => {
              setSigningOut(true);
              void logout()
                .catch((e) => toast.error(e.message))
                .finally(() => setSigningOut(false));
            }}
          >
            <LogOut size={16} />
            {t('Sign out')}
          </Button>
        </div>
      </header>
      <div className="portal-frame">
        <aside className="portal-sidebar">
          <nav aria-label={t('Customer portal')}>
            {navigation.map(([path, label, Icon]) => (
              <NavLink key={path} to={'/portal' + (path ? '/' + path : '')} end={!path}>
                <Icon size={18} />
                {t(label)}
              </NavLink>
            ))}
          </nav>
          <div className="portal-help">
            <ShieldCheck size={22} />
            <strong>{t('Your property account')}</strong>
            <p>
              {t(
                'Only your linked records appear here. For account corrections or new requests, contact your property office.',
              )}
            </p>
          </div>
        </aside>
        <main className="portal-main">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="installments" element={<Installments />} />
            <Route path="payments" element={<Payments />} />
            <Route path="documents" element={<Documents />} />
            <Route path="requests" element={<Requests />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Account />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Routes>
        </main>
      </div>
      <footer className="portal-footer">{t('Your property. Your progress. One place.')}</footer>
    </div>
  );
}

function usePortal<T>(path: string) {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['customer-portal', userId, path],
    queryFn: ({ signal }) => api<T>('/portal/' + path, { signal }),
  });
}
function Paged<T extends { id: string }>({
  path,
  children,
  empty = 'There are no records to show yet.',
}: {
  path: string;
  children: (items: T[]) => ReactNode;
  empty?: string;
}) {
  useLocale();
  const [page, setPage] = useState(1);
  const query = usePortal<Page<T>>(
    path + (path.includes('?') ? '&' : '?') + `page=${page}&limit=12`,
  );
  if (query.isLoading) return <Skeleton />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data!;
  return (
    <>
      {data.items.length ? (
        children(data.items)
      ) : (
        <EmptyState title={t('Nothing here yet')} description={empty} />
      )}
      <div className="portal-pagination">
        <span>
          {data.pagination.total} {t('records · Page')} {page} {t('of')}{' '}
          {Math.max(1, data.pagination.totalPages)}
        </span>
        <div>
          <Button
            variant="secondary"
            size="small"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            {t('Previous')}
          </Button>
          <Button
            variant="secondary"
            size="small"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t('Next')}
          </Button>
        </div>
      </div>
    </>
  );
}
function Metrics({ value, currency }: { value: Position; currency: string }) {
  useLocale();
  return (
    <div className="portal-metrics">
      {[
        ['Contract value', value.total],
        ['Cleared payments', value.paid],
        ['Scheduled balance', value.outstanding],
        ['Overdue', value.overdue],
      ].map(([label, amount]) => (
        <div key={label}>
          <span>{t(label)}</span>
          <strong>{money(amount, currency)}</strong>
        </div>
      ))}
    </div>
  );
}
function Overview() {
  useLocale();
  const name = useAuth((s) => s.user!.name).split(' ')[0];
  const query = usePortal<PortalDashboard>('dashboard');
  return (
    <>
      <section className="portal-welcome">
        <div className="eyebrow">{t('AT HOME WITH YOUR ACCOUNT')}</div>
        <h1>
          {t('Hello,')} {name}.
        </h1>
        <p>{t('A clear view of your properties, payments, and what comes next.')}</p>
        <Link to="/portal/bookings">
          {t('View my properties')} <ArrowUpRight size={17} />
        </Link>
      </section>
      {query.isLoading ? (
        <Skeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {!query.data!.accounts.length && (
            <EmptyState
              title={t('Your account is ready')}
              description={t(
                'Your property office will link your customer records. Contact them if a property is missing.',
              )}
            />
          )}
          {query.data!.accounts.map((account) => (
            <section className="portal-panel" key={account.project.id}>
              <div className="portal-section-heading">
                <div>
                  <div className="eyebrow">{t('YOUR PROPERTY ACCOUNT')}</div>
                  <h2>{account.project.name}</h2>
                </div>
                <Badge
                  value={`${account.bookings} confirmed ${account.bookings === 1 ? 'booking' : 'bookings'}`}
                />
              </div>
              <Metrics value={account} currency={account.project.currency} />
              <p className="portal-note">
                {t(
                  'Balances cover the full confirmed bookings, including joint ownership. Advance credit awaiting allocation:',
                )}{' '}
                {money(account.advanceCredit, account.project.currency)}.
              </p>
            </section>
          ))}
          <section className="portal-panel">
            <div className="portal-section-heading">
              <h2>{t('Next unpaid installments')}</h2>
              <Link to="/portal/installments">
                {t('Full schedule')} <ArrowUpRight size={15} />
              </Link>
            </div>
            {query.data!.upcoming.length ? (
              <div className="portal-due-list">
                {query.data!.upcoming.map((item) => (
                  <Link key={item.id} to={'/portal/bookings/' + item.bookingId}>
                    <div className="portal-calendar">
                      <CalendarClock size={20} />
                    </div>
                    <div>
                      <strong>{item.label}</strong>
                      <p>
                        {item.projectName} · {item.reference}
                      </p>
                      <small>
                        {t('Due')} {date(item.dueDate.slice(0, 10))}
                      </small>
                    </div>
                    <strong>{money(item.outstanding, item.currency)}</strong>
                    <ArrowUpRight size={17} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                title={t('No unpaid installments')}
                description={t(
                  'You have no scheduled amount outstanding on your confirmed bookings.',
                )}
              />
            )}
          </section>
          <p className="portal-note">
            {t('Updated')} {new Date(query.data!.asOf).toLocaleString()}
            {t(
              '. Pending payments appear in payment history and count toward your balance after verification.',
            )}
          </p>
        </>
      )}
    </>
  );
}
function Bookings() {
  useLocale();
  return (
    <>
      <PageHeading
        eyebrow={t('YOUR PORTFOLIO')}
        title={t('My properties')}
        description={t('Booking details for the properties linked to your account.')}
      />
      <Paged<PortalBooking>
        path="bookings"
        empty={t('Your bookings will appear after the office links your customer record.')}
      >
        {(items) => (
          <div className="portal-properties">
            {items.map((b) => (
              <Link className="portal-property" to={'/portal/bookings/' + b.id} key={b.id}>
                <div className="portal-property-art">
                  <Building2 size={44} />
                  <Badge value={b.status} />
                </div>
                <div className="portal-property-body">
                  <span className="eyebrow">{b.unit.project.name}</span>
                  <h2>
                    {t('Unit')} {b.unit.number}
                  </h2>
                  <p>
                    {humanize(b.unit.type)} · {b.unit.size} {b.unit.measurementUnit}
                  </p>
                  <span>{b.reference}</span>
                  <div>
                    <strong>{money(b.total, b.unit.project.currency)}</strong>
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Paged>
    </>
  );
}
function BookingDetail() {
  useLocale();
  const { id } = useParams();
  const query = usePortal<PortalBooking>('bookings/' + id);
  const [tab, setTab] = useState('installments');
  const statement = useMutation({
    mutationFn: async () => {
      const result = await api<{ url: string }>('/portal/bookings/' + id + '/statement/download');
      await saveFile(result.url, 'account-statement.pdf');
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <Skeleton />;
  if (query.isError) return <ErrorState error={query.error} />;
  const b = query.data!;
  return (
    <>
      <Link className="text-link" to="/portal/bookings">
        {t('← My properties')}
      </Link>
      <PageHeading
        title={t('Unit {0}', { '0': b.unit.number })}
        description={`${b.unit.project.name} · ${b.reference}`}
      />
      <section className="portal-panel">
        <div className="portal-section-heading">
          <h2>{t('Booking summary')}</h2>
          <div className="detail-actions">
            <Badge value={b.status} />
            <Button
              variant="secondary"
              size="small"
              busy={statement.isPending}
              onClick={() => statement.mutate()}
            >
              <Download size={15} />
              {t('Account statement')}
            </Button>
          </div>
        </div>
        <dl className="detail-grid">
          <div>
            <dt>{t('Property type')}</dt>
            <dd>{humanize(b.unit.type)}</dd>
          </div>
          <div>
            <dt>{t('Area')}</dt>
            <dd>
              {b.unit.size} {b.unit.measurementUnit}
            </dd>
          </div>
          <div>
            <dt>{t('Location')}</dt>
            <dd>{[b.unit.phase, b.unit.block, b.unit.floor].filter(Boolean).join(' / ') || '—'}</dd>
          </div>
          <div>
            <dt>{t('Booked on')}</dt>
            <dd>{date(b.createdAt)}</dd>
          </div>
        </dl>
        {b.position && <Metrics value={b.position} currency={b.unit.project.currency} />}
        <p className="portal-note">
          {b.status === 'CANCELLED'
            ? t(
                'This booking is cancelled. Historical amounts below do not represent a new payment demand. Contact the office about deductions or refunds.',
              )
            : t(
                'Amounts describe the complete booking. Contact the office for payment instructions or account corrections.',
              )}
        </p>
      </section>
      <nav className="portal-tabs" aria-label={t('Booking information')}>
        {['installments', 'payments', 'documents', 'requests'].map((t) => (
          <button key={t} aria-current={tab === t ? 'page' : undefined} onClick={() => setTab(t)}>
            {humanize(t)}
          </button>
        ))}
      </nav>
      {tab === 'installments' ? (
        <Installments bookingId={b.id} />
      ) : tab === 'payments' ? (
        <Payments bookingId={b.id} />
      ) : tab === 'documents' ? (
        <Documents bookingId={b.id} />
      ) : (
        <Requests bookingId={b.id} />
      )}
    </>
  );
}
function filter(path: string, bookingId?: string) {
  return path + (bookingId ? '?bookingId=' + encodeURIComponent(bookingId) : '');
}
function BookingLink({ booking }: { booking: PortalBooking }) {
  useLocale();
  return (
    <Link to={'/portal/bookings/' + booking.id}>
      <strong>{booking.reference}</strong>
      <small>
        {booking.unit.project.name} {t('· Unit')} {booking.unit.number}
      </small>
    </Link>
  );
}
function Installments({ bookingId }: { bookingId?: string }) {
  useLocale();
  return (
    <>
      <PageHeading
        title={t('Installment schedule')}
        description={t(
          'Amounts allocated to your confirmed bookings. Reversed payments are excluded.',
        )}
      />
      <Paged<PortalInstallment> key={bookingId ?? 'all'} path={filter('installments', bookingId)}>
        {(items) => (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t('Booking / installment')}</th>
                  <th>{t('Due date')}</th>
                  <th>{t('Scheduled')}</th>
                  <th>{t('Paid')}</th>
                  <th>{t('Outstanding')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <BookingLink booking={i.booking} />
                      <small>{i.label}</small>
                    </td>
                    <td>{date(i.dueDate.slice(0, 10))}</td>
                    <td>{money(i.amount, i.booking.unit.project.currency)}</td>
                    <td>{money(i.paid, i.booking.unit.project.currency)}</td>
                    <td>{money(i.outstanding, i.booking.unit.project.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paged>
    </>
  );
}
function Payments({ bookingId }: { bookingId?: string }) {
  useLocale();
  const [receipt, setReceipt] = useState<PortalPayment>();
  return (
    <>
      <PageHeading
        title={t('Payments & receipts')}
        description={t(
          'Payments recorded under your linked customer profiles. Pending amounts await verification.',
        )}
      />
      <Paged<PortalPayment> key={bookingId ?? 'all'} path={filter('payments', bookingId)}>
        {(items) => (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t('Booking')}</th>
                  <th>{t('Paid on')}</th>
                  <th>{t('Amount')}</th>
                  <th>{t('Status')}</th>
                  <th>{t('Receipt')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <BookingLink booking={p.booking} />
                      <small>{humanize(p.method)}</small>
                    </td>
                    <td>{date(p.paidAt)}</td>
                    <td>{money(p.amount, p.booking.unit.project.currency)}</td>
                    <td>
                      <Badge value={p.status} />
                    </td>
                    <td>
                      {p.receipt ? (
                        <Button variant="secondary" size="small" onClick={() => setReceipt(p)}>
                          <ReceiptText size={15} />
                          {p.receipt.reference}
                        </Button>
                      ) : (
                        <span>{t('Awaiting clearance')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paged>
      {receipt?.receipt && (
        <Modal
          open
          onOpenChange={(open) => !open && setReceipt(undefined)}
          title={t('Payment receipt')}
          description={t('Your server-issued payment record.')}
        >
          <div className="modal-body printable-receipt">
            <div className="receipt-brand">
              <ShieldCheck size={28} />
              <div>
                <h2>{receipt.booking.unit.project.name}</h2>
                <p>{receipt.receipt.reference}</p>
              </div>
              <Badge value={receipt.receipt.reversedAt ? 'REVERSED' : receipt.status} />
            </div>
            <div className="receipt-amount">
              {money(receipt.amount, receipt.booking.unit.project.currency)}
            </div>
            <dl className="detail-grid">
              <div>
                <dt>{t('Booking')}</dt>
                <dd>{receipt.booking.reference}</dd>
              </div>
              <div>
                <dt>{t('Property')}</dt>
                <dd>
                  {t('Unit')} {receipt.booking.unit.number}
                </dd>
              </div>
              <div>
                <dt>{t('Method')}</dt>
                <dd>{humanize(receipt.method)}</dd>
              </div>
              <div>
                <dt>{t('Payment date')}</dt>
                <dd>{date(receipt.paidAt)}</dd>
              </div>
              <div>
                <dt>{t('Receipt issued')}</dt>
                <dd>{date(receipt.receipt.createdAt)}</dd>
              </div>
            </dl>
            {receipt.receipt.reversedAt && (
              <p className="field-error">
                {t('This receipt was reversed and is not evidence of a cleared payment.')}
              </p>
            )}
            <Button
              onClick={() =>
                void Promise.resolve(print()).catch((e: Error) => toast.error(e.message))
              }
            >
              <Printer size={16} />
              {t('Print / save PDF')}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Documents({ bookingId }: { bookingId?: string }) {
  useLocale();
  const download = useMutation({
    mutationFn: async (doc: PortalDocument) => {
      const result = await api<{ url: string }>('/portal/documents/' + doc.id + '/download');
      await saveFile(result.url, doc.name);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <PageHeading
        title={t('My documents')}
        description={t('Documents the property office has approved for your portal.')}
      />
      <Paged<PortalDocument>
        key={bookingId ?? 'all'}
        path={filter('documents', bookingId)}
        empty={t(
          'No documents have been shared with you yet. Contact the office if you need a copy.',
        )}
      >
        {(items) => (
          <div className="portal-document-grid">
            {items.map((doc) => (
              <article className="portal-panel" key={doc.id}>
                <Files size={28} />
                <h3>{doc.name}</h3>
                <p>{doc.project.name}</p>
                <small>
                  {Math.ceil(doc.size / 1024)} {t('KB ·')} {date(doc.createdAt)}
                </small>
                <Button
                  variant="secondary"
                  busy={download.isPending && download.variables?.id === doc.id}
                  onClick={() => download.mutate(doc)}
                >
                  <Download size={16} />
                  {t('Download')}
                </Button>
              </article>
            ))}
          </div>
        )}
      </Paged>
    </>
  );
}
function Requests({ bookingId }: { bookingId?: string }) {
  useLocale();
  const [kind, setKind] = useState('ndcs');
  return (
    <>
      <PageHeading
        title={t('Request status')}
        description={t(
          'Track requests handled by your property office. Contact them to start or amend a request.',
        )}
      />
      <nav className="portal-tabs" aria-label={t('Request type')}>
        {[
          ['ndcs', 'NDCs'],
          ['transfers', 'Transfers'],
          ['refunds', 'Refunds'],
          ['possessions', 'Possession'],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-current={value === kind ? 'page' : undefined}
            onClick={() => setKind(value!)}
          >
            {t(label)}
          </button>
        ))}
      </nav>
      <Paged<PortalRequest>
        key={kind + (bookingId ?? '')}
        path={`requests?kind=${kind}${bookingId ? '&bookingId=' + bookingId : ''}`}
      >
        {(items) => (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t('Booking')}</th>
                  <th>{t('Reference')}</th>
                  <th>{t('Status')}</th>
                  <th>{t('Latest milestone')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <BookingLink booking={r.booking} />
                    </td>
                    <td>{r.reference ?? '—'}</td>
                    <td>
                      <Badge value={r.status} />
                    </td>
                    <td>
                      {date(
                        r.completedAt ?? r.handoverAt ?? r.paidAt ?? r.issuedAt ?? r.inspectionAt,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paged>
    </>
  );
}
function Notifications() {
  useLocale();
  const [revision, setRevision] = useState(0);
  const read = useMutation({
    mutationFn: (id: string) =>
      api('/portal/notifications/' + id + '/read', { method: 'POST', body: {} }),
    onSuccess: () => setRevision((v) => v + 1),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <PageHeading
        title={t('Notifications')}
        description={t('Updates from your property account.')}
      />
      <Paged<PortalNotice> key={revision} path="notifications">
        {(items) => (
          <div className="portal-notices">
            {items.map((n) => (
              <article className="portal-panel" key={n.id}>
                <Bell size={21} />
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                  <small>{date(n.createdAt)}</small>
                </div>
                {!n.readAt && (
                  <Button
                    variant="secondary"
                    size="small"
                    busy={read.isPending && read.variables === n.id}
                    onClick={() => read.mutate(n.id)}
                  >
                    {t('Mark read')}
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </Paged>
    </>
  );
}
function Account() {
  useLocale();
  return (
    <>
      <PageHeading
        title={t('My customer profiles')}
        description={t(
          'Contact your property office to correct customer details or link another property.',
        )}
      />
      <Paged<PortalProfile> path="profile">
        {(items) => (
          <div className="portal-document-grid">
            {items.map((p) => (
              <article className="portal-panel" key={p.id}>
                <span className="eyebrow">{p.project.name}</span>
                <h2>{p.name}</h2>
                <p>{p.reference}</p>
                <dl className="detail-grid">
                  <div>
                    <dt>{t('Email')}</dt>
                    <dd>{p.email ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t('Phone')}</dt>
                    <dd>{p.phone}</dd>
                  </div>
                  <div>
                    <dt>{t('Address')}</dt>
                    <dd>{p.address ?? '—'}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </Paged>
      <Profile />
    </>
  );
}
