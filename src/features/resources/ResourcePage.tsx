import { Money } from '../../components/Money';
import { ProjectDetail } from './ProjectDetail';
import { errorMessage } from '../../lib/error-messages';
import { t, useLocale } from '../../lib/i18n';
import { OwnershipGuide } from '../../components/OwnershipVerification';
import { useState, useEffect, useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { RecordImage } from '../../components/ImageUpload';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  RefreshCw,
  ArrowUpRight,
  MoreHorizontal,
  Grid3X3,
  ScanLine,
  Pencil,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { resources, resourcePath, actionsFor, actionTitle } from './catalog';
import { operations, projectRoot, resolvePath } from '../../lib/contract';
import { api, queryString } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { platform, scanCode } from '../../platform/adapter';
import { toast } from 'sonner';
import { asRows, row, type Row, type Page, type Operation } from '../../lib/types';
import { humanize, labelOf, date } from '../../lib/format';
import { Button, PageHeading, ErrorState, EmptyState, Badge } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { Select } from '../../components/Select';
import { OperationDialog } from '../../components/OperationDialog';
import RecordDetail from './RecordDetail';
import { PropertyPurchaseWizard } from './PropertyPurchaseWizard';
import { JournalVoucher } from './JournalVoucher';
import { DeleteWithPasswordModal } from '../../components/DeleteWithPasswordModal';
import { UnassignPropertyModal } from '../bookings/UnassignPropertyModal';
import { CustomerGroups, PaymentStatus, PortfolioLinks } from './Portfolio';
import { ProjectTableHeading, projectCell, projectColumnLabels } from './ProjectTable';
import { PropertyPurchaseGuide, purchaseCell, purchaseColumnLabels } from './PurchaseTable';
export function ProjectRequired() {
  useLocale();
  return (
    <div className="panel">
      <EmptyState
        title={t('Your next project starts here')}
        description={t(
          'Choose a project from the sidebar, or create your first development to bring your workspace to life.',
        )}
        action={
          <Button asChild>
            <Link to="/projects">
              <Plus size={16} />
              {t('Explore projects')}
            </Link>
          </Button>
        }
      />
    </div>
  );
}
export function Unauthorized() {
  useLocale();
  return (
    <ErrorState
      error={
        new Error(
          t(
            'Your role does not have access to this workspace. Ask an administrator to update your permissions.',
          ),
        )
      }
    />
  );
}
function bookingCell(key: string, record: Row) {
  if (key === 'customer' || key === 'unit') {
    const item = row(record[key]);
    const href = key === 'customer' ? '/customers/' : '/inventory?record=';
    const label = String(item.name ?? item.number ?? '—');
    const details =
      key === 'customer'
        ? String(item.phone ?? '')
        : [item.size, item.measurementUnit, item.phase, item.block].filter(Boolean).join(' · ');
    return (
      <div className="booking-table-identity">
        {item.id && can(key === 'customer' ? 'customers.read' : 'inventory.read') ? (
          <Link to={href + item.id} onClick={(e) => e.stopPropagation()}>
            {label}
          </Link>
        ) : (
          <strong>{label}</strong>
        )}
        <small>{details}</small>
      </div>
    );
  }
  if (key === 'nextDue')
    return record.status === 'CONFIRMED' && record.nextDue ? date(record.nextDue) : '—';
  if (key === 'paid')
    return (
      <div className="booking-table-identity">
        <strong>
          <Money value={record.paid} />
        </strong>
        {Number(record.pendingPayments) > 0 && (
          <small>
            {t('Awaiting verification')}: {String(record.pendingPayments)}
          </small>
        )}
      </div>
    );
  return undefined;
}
export default function ResourcePage({ slug }: { slug: string }) {
  const language = useLocale();
  const resource = resources.find((r) => r.slug === slug)!;
  const projectId = usePreferences((s) => s.projectId);
  const setProject = usePreferences((s) => s.setProject);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [action, setAction] = useState<{
    operation: Operation;
    title: string;
    record?: Row;
  } | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [voucherJournalId, setVoucherJournalId] = useState<string | null>(null);
  const [unassignRecord, setUnassignRecord] = useState<Row | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<Row | null>(null);
  const path = resource.report ? projectRoot + '/reports' : resourcePath(resource);
  const get = operations.find((op) => op.path === path && op.method === 'get');
  const queryParams = useMemo(
    () => new Set(get?.parameters.filter((p) => p.in === 'query').map((p) => p.name)),
    [get],
  );
  const page = Number(params.get('page') || 1);
  const requestedLimit = Number(params.get('limit') || 25);
  const limit = [10, 25, 50, 100].includes(requestedLimit) ? requestedLimit : 25;
  const view = params.get('view') ?? 'table';
  const queryValues = Object.fromEntries(
    [...params.entries()].filter(([key]) => queryParams.has(key)),
  );
  if (resource.report) queryValues.kind = resource.report;
  const paginated = queryParams.has('page');
  const query = useQuery({
    queryKey: ['resource', projectId, slug, queryValues],
    enabled: can(resource.permission) && (resource.global || !!projectId),
    placeholderData: keepPreviousData,
    ...(slug === 'customers'
      ? { refetchOnWindowFocus: 'always' as const, refetchOnMount: 'always' as const }
      : {}),
    queryFn: ({ signal }) =>
      api(
        resolvePath(path) + queryString({ ...queryValues, ...(paginated ? { page, limit } : {}) }),
        { signal },
      ),
  });
  let items = resource.report
    ? asRows(row(query.data).rows)
    : slug === 'roles'
      ? asRows(row(query.data).roles)
      : asRows(query.data);
  const total = paginated
    ? ((query.data as Page | undefined)?.pagination?.total ?? 0)
    : items.length;
  if (!paginated) items = items.slice((page - 1) * limit, page * limit);
  const dataItems = items;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (params.get('search') ?? '')) {
        const next = new URLSearchParams(params);
        if (search) next.set('search', search);
        else next.delete('search');
        next.delete('page');
        setParams(next, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, params, setParams]);
  useEffect(() => {
    const id = params.get('record');
    if (id) {
      if (slug === 'customers') {
        navigate(`/customers/${id}`, { replace: true });
        return;
      }
      if (slug === 'users') {
        navigate(`/users/${id}`, { replace: true });
        return;
      }
      const records = resource.report ? asRows(row(query.data).rows) : asRows(query.data);
      const found = records.find((r) => r.id === id);
      setDetail(found ?? { id });
    }
  }, [params, query.data, resource.report, slug, navigate]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }
  if (!can(resource.permission)) return <Unauthorized />;
  if (!resource.global && !projectId) return <ProjectRequired />;
  const createActions = actionsFor(resource).filter(
    (op) => !(slug === 'bookings' && op.path === resourcePath(resource)),
  );
  const statuses = get?.parameters.find((p) => p.name === 'status')?.schema.enum;
  const related = resources.filter(
    (r) => r.group === resource.group && r.slug !== slug && can(r.permission),
  );
  const showSearch =
    queryParams.has('search') &&
    [
      'projects',
      'inventory',
      'customers',
      'bookings',
      'payment-plans',
      'document-templates',
    ].includes(slug);
  function rowActions(record: Row) {
    const allowed = actionsFor(resource, record);
    const edit = slug === 'customers' ? allowed.find((op) => op.method === 'patch') : undefined;
    const verify =
      slug === 'collections' ? allowed.find((op) => op.path.endsWith('/verify')) : undefined;
    const postPurchase =
      slug === 'property-purchases' ? allowed.find((op) => op.path.endsWith('/post')) : undefined;
    const editPurchase =
      slug === 'property-purchases' ? allowed.find((op) => op.method === 'patch') : undefined;
    return (
      <div className="row-actions">
        {verify && (
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              setAction({ operation: verify, title: actionTitle(verify, resource), record })
            }
          >
            {t('Verify payment')}
          </Button>
        )}
        {postPurchase && (
          <Button
            size="small"
            variant="primary"
            onClick={() =>
              setAction({
                operation: postPurchase,
                title: actionTitle(postPurchase, resource),
                record,
              })
            }
          >
            <CheckCircle2 size={13} />
            {t('Post purchase')}
          </Button>
        )}
        {editPurchase && (
          <Button
            variant="secondary"
            size="small"
            aria-label={t('Edit {name}', { name: labelOf(record) })}
            onClick={() =>
              setAction({
                operation: editPurchase,
                title: actionTitle(editPurchase, resource),
                record,
              })
            }
          >
            <Pencil size={13} />
            {t('Edit')}
          </Button>
        )}
        {slug === 'property-purchases' && Boolean(record.journalId) && can('finance.read') && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => setVoucherJournalId(String(record.journalId))}
          >
            <FileText size={13} />
            {t('Print voucher')}
          </Button>
        )}
        {edit && (
          <Button
            variant="secondary"
            size="small"
            aria-label={t('Edit {name}', { name: labelOf(record) })}
            onClick={() =>
              setAction({ operation: edit, title: actionTitle(edit, resource), record })
            }
          >
            <Pencil size={13} />
            {t('Edit')}
          </Button>
        )}
        {slug === 'users' && record.id && (
          <Button variant="secondary" size="small" onClick={() => navigate(`/users/${record.id}`)}>
            <ArrowUpRight size={13} />
            {t('View user')}
          </Button>
        )}
        {slug === 'customers' && record.id && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate(`/customers/${record.id}`)}
          >
            <ArrowUpRight size={13} />
            {t('View customer')}
          </Button>
        )}
        {slug === 'projects' && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              setProject(
                String(record.id),
                String(record.name),
                String(record.currency ?? 'PKR'),
                String(record.timezone ?? 'Asia/Karachi'),
              );
              navigate('/dashboard');
            }}
          >
            {t('Open workspace')}
            <ArrowUpRight size={14} />
          </Button>
        )}
        {(allowed.some(
          (op) => op !== edit && op !== verify && op !== postPurchase && op !== editPurchase,
        ) ||
          slug === 'inventory' ||
          slug === 'bookings') && (
          <DropdownMenu.Root modal={false} dir={language === 'en' ? 'ltr' : 'rtl'}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="actions-menu-trigger"
                aria-label={t('Actions for {0}', { '0': labelOf(record) })}
              >
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="actions-menu"
                align="end"
                sideOffset={6}
                collisionPadding={8}
                hideWhenDetached
                loop
              >
                {slug === 'inventory' &&
                  can('bookings.cancel') &&
                  ['BOOKED', 'SOLD'].includes(String(record.status)) && (
                    <DropdownMenu.Item
                      className="actions-menu-item"
                      onSelect={() => setUnassignRecord(record)}
                    >
                      {t('Unassign property')}
                    </DropdownMenu.Item>
                  )}
                {slug === 'bookings' &&
                  can('bookings.cancel') &&
                  ['CONFIRMED', 'DRAFT'].includes(String(record.status)) && (
                    <DropdownMenu.Item
                      className="actions-menu-item"
                      onSelect={() => setUnassignRecord(record)}
                    >
                      {t('Retract booking')}
                    </DropdownMenu.Item>
                  )}
                {allowed
                  .filter(
                    (op) =>
                      op !== edit && op !== verify && op !== postPurchase && op !== editPurchase,
                  )
                  .map((op) => (
                    <DropdownMenu.Item
                      key={op.id}
                      className="actions-menu-item"
                      onSelect={() =>
                        op.path.endsWith('/reschedule')
                          ? navigate('/payment-plans?booking=' + record.id)
                          : setAction({ operation: op, title: actionTitle(op, resource), record })
                      }
                    >
                      {t(actionTitle(op, resource))}
                    </DropdownMenu.Item>
                  ))}
                {slug === 'inventory' && can('users.manage') && can('inventory.update') && (
                  <DropdownMenu.Item
                    className="actions-menu-item"
                    style={{ color: 'var(--danger, #ef4444)' }}
                    onSelect={() => setDeleteRecord(record)}
                  >
                    {t('Delete property')}
                  </DropdownMenu.Item>
                )}
                {slug === 'bookings' && can('users.manage') && (
                  <DropdownMenu.Item
                    className="actions-menu-item"
                    style={{ color: 'var(--danger, #ef4444)' }}
                    onSelect={() => setDeleteRecord(record)}
                  >
                    {t('Delete booking')}
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    );
  }
  return (
    <>
      <PageHeading
        eyebrow={resource.group}
        title={resource.label}
        description={resource.description}
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label={t('Refresh records')}
              onClick={() => void query.refetch()}
            >
              <RefreshCw size={16} className={query.isFetching ? 'spin' : ''} />
            </Button>
            {slug === 'bookings' && can('bookings.create') && (
              <Button asChild>
                <Link to="/bookings/new">
                  <Plus size={17} />
                  {t('New booking')}
                </Link>
              </Button>
            )}
            {slug === 'customers' && can('customers.create') && (
              <Button asChild>
                <Link to="/members/register">
                  <Plus size={17} />
                  {t('Register member')}
                </Link>
              </Button>
            )}
            {createActions
              .filter((op) => !(slug === 'customers' && op.path === resourcePath(resource)))
              .map((op) => (
                <Button
                  key={op.id}
                  variant={op.path === resourcePath(resource) ? 'primary' : 'secondary'}
                  onClick={() => setAction({ operation: op, title: actionTitle(op, resource) })}
                >
                  <Plus size={16} />
                  {t(actionTitle(op, resource))}
                </Button>
              ))}
          </>
        }
      />
      {slug === 'customers' && can('bookings.read') && (
        <CustomerGroups
          selected={params.get('group') ?? ''}
          groups={row(row(query.data).groups)}
          busy={query.isFetching}
          onChange={(value) => update('group', value)}
        />
      )}
      {(slug === 'transfers' || slug === 'possessions') && (
        <OwnershipGuide possession={slug === 'possessions'} />
      )}
      {slug === 'property-purchases' && <PropertyPurchaseGuide />}
      {slug === 'collections' && (
        <div className="document-notice">
          {t(
            'Pending payments do not reduce the balance. Another authorised staff member must choose Verify payment, then Cleared after checking the funds. Cash received from the installment schedule is approved immediately by staff with verification permission.',
          )}
        </div>
      )}
      {related.length > 0 && (
        <div className="module-links">
          {related.map((r) => (
            <Link to={'/' + r.slug} key={r.slug}>
              {t(r.label)}
              <ArrowUpRight size={12} />
            </Link>
          ))}
        </div>
      )}
      <section className={slug === 'projects' ? 'panel projects-panel' : 'panel'}>
        {slug === 'projects' && <ProjectTableHeading />}
        <div className="table-toolbar">
          <div className="toolbar-filters">
            {showSearch && (
              <div className="input-icon">
                <Search size={16} />
                <input
                  aria-label={t('Search {0}', { '0': t(resource.label) })}
                  placeholder={t('Search {0}…', { '0': t(resource.label) })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            {statuses && (
              <Select
                aria-label={t('Filter by status')}
                value={params.get('status') ?? ''}
                onChange={(value) => update('status', value)}
                options={[
                  { value: '', label: t('All statuses') },
                  ...statuses.map((value) => ({
                    value: String(value),
                    label: humanize(String(value)),
                  })),
                ]}
              />
            )}
            {slug === 'inventory' && (
              <input
                aria-label={t('Filter by phase')}
                placeholder={t('Phase')}
                value={params.get('phase') ?? ''}
                onChange={(e) => update('phase', e.target.value)}
              />
            )}
            <Select
              aria-label={t('Sort order')}
              value={params.get('sort') ?? 'desc'}
              onChange={(value) => update('sort', value)}
              disabled={!queryParams.has('sort')}
              options={[
                { value: 'desc', label: t('Descending') },
                { value: 'asc', label: t('Ascending') },
              ]}
            />
          </div>
          {resource.views && (
            <div className="segmented">
              {slug === 'inventory' && (
                <button
                  aria-label={t('Matrix view')}
                  aria-pressed={view === 'matrix'}
                  onClick={() => update('view', 'matrix')}
                >
                  <Grid3X3 size={17} />
                </button>
              )}
              {platform.mobile && (
                <button
                  aria-label={t('Scan property reference')}
                  onClick={() =>
                    void scanCode()
                      .then(setSearch)
                      .catch((e: Error) => toast.error(errorMessage(e)))
                  }
                >
                  <ScanLine size={17} />
                </button>
              )}
              <button
                aria-label={t('Table view')}
                aria-pressed={view === 'table'}
                onClick={() => update('view', 'table')}
              >
                <List size={17} />
              </button>
              <button
                aria-label={t('Card view')}
                aria-pressed={view === 'grid'}
                onClick={() => update('view', 'grid')}
              >
                <LayoutGrid size={17} />
              </button>
            </div>
          )}
        </div>
        {query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : view === 'matrix' && slug === 'inventory' && dataItems.length ? (
          <>
            <div className="view-note">
              {t('Showing the current page of')} {total}{' '}
              {t('units. Filter by phase or status to narrow the matrix.')}
            </div>
            <div className="inventory-matrix">
              {[
                ...new Set(
                  dataItems.map(
                    (r) => String(r.phase ?? 'No phase') + ' / ' + String(r.block ?? 'No block'),
                  ),
                ),
              ].map((group) => (
                <section className="matrix-group" key={group}>
                  <h3>{group}</h3>
                  <div className="matrix-units">
                    {dataItems
                      .filter(
                        (r) =>
                          String(r.phase ?? 'No phase') + ' / ' + String(r.block ?? 'No block') ===
                          group,
                      )
                      .map((r) => (
                        <button
                          className="matrix-unit"
                          data-status={r.status}
                          key={r.id}
                          onClick={() => setDetail(r)}
                        >
                          <strong>{labelOf(r)}</strong>
                          <Badge value={r.status} />
                        </button>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : view === 'grid' && dataItems.length ? (
          <div className="inventory-grid">
            {dataItems.map((r) => (
              <button className="unit-card" key={r.id} onClick={() => setDetail(r)}>
                <div>
                  {r.photoId ? (
                    <RecordImage id={String(r.photoId)} alt={labelOf(r)} />
                  ) : (
                    <resource.icon size={21} />
                  )}
                  <Badge value={r.status} />
                </div>
                <h3>{labelOf(r)}</h3>
                <p>
                  {humanize(String(r.type))} · {String(r.size)} {String(r.measurementUnit)}
                </p>
                <footer>
                  <span>
                    {String(r.phase ?? 'Unassigned phase')}
                    {r.block ? ' / ' + String(r.block) : ''}
                  </span>
                  <strong>
                    <Money value={r.price} />
                  </strong>
                </footer>
              </button>
            ))}
          </div>
        ) : (
          <DataTable
            directory={slug === 'customers'}
            columnLabels={
              slug === 'projects'
                ? projectColumnLabels
                : slug === 'property-purchases'
                  ? purchaseColumnLabels
                  : undefined
            }
            imageIdentity={
              slug === 'projects' ? 'name' : slug === 'inventory' ? 'number' : undefined
            }
            data={dataItems}
            columns={resource.columns.filter(
              (key) => !['bookings', 'paymentStatus'].includes(key) || can('bookings.read'),
            )}
            renderCell={(key, record) =>
              slug === 'bookings' ? (
                bookingCell(key, record)
              ) : slug === 'projects' ? (
                projectCell(key, record)
              ) : slug === 'property-purchases' ? (
                purchaseCell(key, record, (jId) => setVoucherJournalId(jId))
              ) : key === 'bookings' && (slug === 'customers' || slug === 'inventory') ? (
                <PortfolioLinks record={record} kind={slug} />
              ) : key === 'paymentStatus' ? (
                <PaymentStatus value={record.paymentStatus} />
              ) : undefined
            }
            busy={query.isLoading}
            onRow={(record) => {
              if (slug === 'customers' && record.id) {
                navigate(`/customers/${record.id}`);
              } else if (slug === 'users' && record.id) {
                navigate(`/users/${record.id}`);
              } else {
                setDetail(record);
              }
            }}
            actions={rowActions}
            page={page}
            total={total}
            limit={limit}
            onPage={(p) => update('page', String(p))}
            onLimit={paginated ? (n) => update('limit', String(n)) : undefined}
          />
        )}
      </section>
      {['grid', 'matrix'].includes(view) && total > limit && (
        <div className="grid-pagination">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => update('page', String(page - 1))}
          >
            {t('Previous page')}
          </Button>
          <span>
            {t('Page')} {page} · {total} {t('records')}
          </span>
          <Button
            variant="secondary"
            disabled={page * limit >= total}
            onClick={() => update('page', String(page + 1))}
          >
            {t('Next page')}
          </Button>
        </div>
      )}
      {detail &&
        (slug === 'projects' ? (
          <ProjectDetail
            record={detail}
            onClose={() => {
              setDetail(null);
              if (params.has('record')) update('record', '');
            }}
          />
        ) : (
          <RecordDetail
            resource={resource}
            record={detail}
            onClose={() => {
              setDetail(null);
              if (params.has('record')) update('record', '');
            }}
          />
        ))}
      {action &&
        (slug === 'property-purchases' &&
        ((action.operation.method === 'post' &&
          action.operation.path.endsWith('/property-purchases')) ||
          (action.operation.method === 'patch' &&
            action.operation.path.endsWith('/property-purchases/{id}'))) ? (
          <PropertyPurchaseWizard
            operation={action.operation}
            record={action.record}
            onClose={() => setAction(null)}
            onSuccess={() => {
              setAction(null);
              query.refetch();
            }}
          />
        ) : (
          <OperationDialog
            {...action}
            onClose={() => setAction(null)}
            onSuccess={(res) => {
              const createdId = (res as { id?: string })?.id;
              if (slug === 'customers' && createdId) {
                setAction(null);
                navigate(`/customers/${createdId}`);
              } else if (slug === 'users' && createdId) {
                setAction(null);
                navigate(`/users/${createdId}`);
              }
            }}
          />
        ))}
      {voucherJournalId && (
        <JournalVoucher id={voucherJournalId} onClose={() => setVoucherJournalId(null)} />
      )}
      {unassignRecord && (
        <UnassignPropertyModal
          open={!!unassignRecord}
          onClose={() => setUnassignRecord(null)}
          onSuccess={() => {
            query.refetch();
          }}
          unitId={slug === 'inventory' ? String(unassignRecord.id) : undefined}
          unitNumber={slug === 'inventory' ? String(unassignRecord.number) : undefined}
          bookingId={slug === 'bookings' ? String(unassignRecord.id) : undefined}
          bookingReference={slug === 'bookings' ? String(unassignRecord.reference) : undefined}
          customerName={
            slug === 'bookings' ? String(row(unassignRecord.customer).name ?? '') : undefined
          }
          initialCollected={slug === 'bookings' ? String(unassignRecord.paid ?? '0') : undefined}
        />
      )}
      {deleteRecord && (
        <DeleteWithPasswordModal
          open={!!deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => {
            query.refetch();
          }}
          title={slug === 'inventory' ? t('Delete property') : t('Delete booking')}
          itemType={slug === 'inventory' ? 'property' : 'booking'}
          itemName={
            slug === 'inventory'
              ? String(deleteRecord.number ?? deleteRecord.id)
              : String(deleteRecord.reference ?? deleteRecord.id)
          }
          apiPath={
            slug === 'inventory'
              ? `/projects/${projectId}/units/${deleteRecord.id}`
              : `/projects/${projectId}/bookings/${deleteRecord.id}`
          }
        />
      )}
    </>
  );
}
