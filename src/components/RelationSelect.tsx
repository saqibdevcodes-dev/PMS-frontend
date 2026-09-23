import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, queryString } from '../lib/api';
import { operations, projectRoot, resolvePath, supportsQuery } from '../lib/contract';
import { asRows, row, type Row, type Page } from '../lib/types';
import { labelOf, shortId } from '../lib/format';
import { usePreferences } from '../stores/preferences';
import { can } from '../stores/auth';
import { Button } from './ui';
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
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  onRecord?: (record: Row) => void;
  entityId?: string;
  disabled?: boolean;
}) {
  const projectId = usePreferences((s) => s.projectId);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
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
    queryKey: ['relation', projectId, name, debounced, page],
    enabled: permitted,
    queryFn: ({ signal }) =>
      api(
        resolvePath(path) +
          queryString({
            ...(supportsQuery(path, 'page') ? { page, limit: 25 } : {}),
            ...(supportsQuery(path, 'search') ? { search: debounced } : {}),
          }),
        { signal },
      ),
  });
  let items = asRows(query.data);
  if (source === '/roles') items = asRows(row(query.data).roles);
  if (name === 'planVersionId')
    items = items.flatMap((p) =>
      asRows(p.versions).map((v) => ({ ...v, name: `${labelOf(p)} · v${v.version}`, plan: p })),
    );
  if (name === 'approvalId' || name === 'discountApprovalId')
    items = items.filter((r) => r.status === 'APPROVED' && (!entityId || r.entityId === entityId));
  if (debounced && !supportsQuery(path, 'search'))
    items = items.filter((r) => labelOf(r).toLowerCase().includes(debounced.toLowerCase()));
  const totalPages = (query.data as Page | undefined)?.pagination?.totalPages ?? 1;
  if (!permitted)
    return (
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Record ID (lookup permission required)"
        disabled={disabled}
      />
    );
  return (
    <div className="relation-field">
      <div className="input-icon">
        <Search size={14} />
        <input
          aria-label={`Search ${name}`}
          placeholder="Search records…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
        />
      </div>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          const item = items.find((r) => r.id === e.target.value);
          if (item) onRecord?.(item);
        }}
      >
        <option value="">{query.isLoading ? 'Loading…' : 'Select a record'}</option>
        {value && !items.some((r) => r.id === value) && (
          <option value={value}>{shortId(value)} · selected record</option>
        )}
        {items.map((r) => (
          <option key={r.id} value={r.id}>
            {labelOf(r)}
            {r.status ? ` · ${r.status}` : ''}
          </option>
        ))}
      </select>
      {totalPages > 1 && (
        <div className="relation-pager">
          <Button
            type="button"
            variant="ghost"
            size="small"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={14} />
          </Button>
          <small>
            Page {page} of {totalPages}
          </small>
          <Button
            type="button"
            variant="ghost"
            size="small"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
      {query.isError && (
        <small className="field-error">Could not load records. Retry your search.</small>
      )}
    </div>
  );
}
