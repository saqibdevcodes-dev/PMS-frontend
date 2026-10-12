import { t, useLocale } from '../lib/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, queryString } from '../lib/api';
import { operations, projectRoot, resolvePath, supportsQuery } from '../lib/contract';
import { asRows, row, type Row, type Page } from '../lib/types';
import { roleDescriptions, fieldLabels } from '../lib/form-guidance';
import { labelOf, shortId, humanize } from '../lib/format';
import { usePreferences } from '../stores/preferences';
import { can } from '../stores/auth';
import { Button } from './ui';
import { SearchSelect } from './SearchSelect';
export const relationPaths: Record<string, string> = {
  customerId: 'customers',
  buyerId: 'customers',
  unitId: 'units',
  bookingId: 'bookings',
  reservationId: 'reservations',
  planVersionId: 'payment-plans',
  dealerId: 'dealers',
  approvalId: 'approvals',
  discountApprovalId: 'approvals',
  accountId: 'accounts',
  receivingAccountId: 'accounts',
  bankAccountId: 'bank-accounts',
  vendorId: 'vendors',
  ndcId: 'ndcs',
  cancellationId: 'cancellations',
  roleIds: '/roles',
  projectIds: '/projects',
  assignedTo: '/users',
  cash: 'accounts',
  advances: 'accounts',
  dealerPayable: 'accounts',
  deductions: 'accounts',
  transferRevenue: 'accounts',
  commissionExpense: 'accounts',
  dealerRecoverable: 'accounts',
};
export function RelationSelect({
  name,
  value,
  onChange,
  id,
  onRecord,
  entityId,
  disabled,
  statusFilter,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  onRecord?: (record: Row) => void;
  entityId?: string;
  disabled?: boolean;
  statusFilter?: string;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<Row>();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  const source = relationPaths[name];
  const path = source?.startsWith('/') ? source : projectRoot + '/' + source;
  const op = operations.find((o) => o.path === path && o.method === 'get');
  const permitted = Boolean(op && can(op.permission) && (source?.startsWith('/') || projectId));
  const query = useQuery({
    queryKey: ['relation', projectId, name, debounced, page, statusFilter],
    enabled: permitted,
    queryFn: ({ signal }) =>
      api(
        resolvePath(path) +
          queryString({
            ...(statusFilter && supportsQuery(path, 'status') ? { status: statusFilter } : {}),
            ...(supportsQuery(path, 'page') ? { page, limit: 25 } : {}),
            ...(supportsQuery(path, 'search') ? { search: debounced } : {}),
          }),
        { signal },
      ),
  });
  const items = useMemo(() => {
    let items = asRows(query.data);
    if (source === '/roles') items = asRows(row(query.data).roles);
    if (name === 'planVersionId')
      items = items.flatMap((p) =>
        asRows(p.versions).map((v) => ({ ...v, name: `${labelOf(p)} · v${v.version}`, plan: p })),
      );
    if (name === 'approvalId' || name === 'discountApprovalId')
      items = items.filter(
        (r) => r.status === 'APPROVED' && (!entityId || r.entityId === entityId),
      );
    if (debounced && !supportsQuery(path, 'search'))
      items = items.filter((r) => labelOf(r).toLowerCase().includes(debounced.toLowerCase()));
    return items;
  }, [query.data, name, source, entityId, debounced, path]);
  useEffect(() => {
    const match = items.find((item) => item.id === value);
    if (match) setSelectedRecord(match);
  }, [items, value]);
  const selected =
    items.find((item) => item.id === value) ??
    (selectedRecord?.id === value ? selectedRecord : undefined);
  const optionLabel = (record: Row) =>
    `${name === 'roleIds' ? t(labelOf(record)) : labelOf(record)}${record.status ? ` · ${humanize(String(record.status))}` : ''}`;
  const totalPages = (query.data as Page | undefined)?.pagination?.totalPages ?? 1;
  if (!permitted)
    return (
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('Record ID (lookup permission required)')}
        disabled={disabled}
      />
    );
  return (
    <div className="relation-field">
      <SearchSelect
        id={id}
        value={value}
        disabled={disabled}
        search={search}
        onSearch={setSearch}
        searchLabel={t('Search {0}…', { '0': t(fieldLabels[name] ?? 'records') })}
        options={items.map((record) => ({ value: record.id!, label: optionLabel(record) }))}
        selectedLabel={
          value
            ? selected
              ? optionLabel(selected)
              : `${shortId(value)} ${t('· selected record')}`
            : undefined
        }
        loading={query.isFetching || search !== debounced}
        error={query.isError}
        onRetry={() => void query.refetch()}
        onChange={(value) => {
          onChange(value);
          const item = items.find((r) => r.id === value);
          if (item) onRecord?.(item);
        }}
        footer={
          totalPages > 1 && (
            <div className="relation-pager">
              <Button
                type="button"
                variant="ghost"
                size="small"
                disabled={page === 1}
                aria-label={t('Previous results')}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <small>
                {t('Page')} {page} {t('of')} {totalPages}
              </small>
              <Button
                type="button"
                variant="ghost"
                size="small"
                disabled={page >= totalPages}
                aria-label={t('Next results')}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )
        }
      />
      {name === 'roleIds' && selected && (
        <div className="role-explanation">
          <p>
            {t(
              roleDescriptions[String(selected.name)] ??
                'Custom role. Review its current permissions below.',
            )}
          </p>
          <details>
            <summary>{t('View current permissions')}</summary>
            <ul>
              {asRows(selected.permissions).map((p) => (
                <li key={String(p.permissionKey)}>{humanize(String(p.permissionKey))}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
      {query.isError && (
        <small className="field-error">{t('Could not load records. Retry your search.')}</small>
      )}
    </div>
  );
}
