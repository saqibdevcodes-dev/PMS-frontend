import { t, useLocale } from '../lib/i18n';
import { useMemo, useState, type ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { Columns3, ChevronLeft, ChevronRight, ArrowUpRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { date, humanize, labelOf, money, moneyFields, shortId } from '../lib/format';
import { type Row, asRows, row } from '../lib/types';
import { RecordImage } from './ImageUpload';
import { Badge, Button, EmptyState, Skeleton } from './ui';
import { usePreferences } from '../stores/preferences';
export function DisplayValue({
  name,
  value,
  currency = usePreferences.getState().currency,
}: {
  name: string;
  value: unknown;
  currency?: string;
}) {
  useLocale();
  if (value === null || value === undefined || value === '')
    return <span className="muted">—</span>;
  if (name === 'photoId' || name === 'proofImageId' || name === 'imageId')
    return <RecordImage id={String(value)} />;
  if (name === 'status' || typeof value === 'boolean') return <Badge value={value} />;
  if (moneyFields.test(name)) return <span className="numeric">{money(value, currency)}</span>;
  if (/At$|Date$/.test(name)) return <span className="nowrap">{date(value)}</span>;
  if (name === 'identityLast4') return <span className="numeric">•••• {String(value)}</span>;
  if (name === 'id' || /Id$/.test(name))
    return (
      <span className="record-id" title={String(value)}>
        {shortId(value)}
      </span>
    );
  if (name === 'roles')
    return (
      <span>
        {asRows(value)
          .map((v) => String(row(v.role).name ?? v.name ?? ''))
          .filter(Boolean)
          .join(', ') || t('No roles')}
      </span>
    );
  if (Array.isArray(value))
    return (
      <span className="muted">
        {value.length} {humanize(name).toLowerCase()}
      </span>
    );
  if (typeof value === 'object') return <span>{labelOf(row(value))}</span>;
  if (name === 'type' || name === 'operation' || name === 'method' || name === 'source')
    return <span>{humanize(String(value))}</span>;
  return <span>{String(value)}</span>;
}
export function DataTable({
  data,
  columns,
  busy,
  onRow,
  actions,
  page = 1,
  total,
  limit = 25,
  onPage,
  currency = usePreferences.getState().currency,
  empty,
  controls = true,
  directory = false,
  onLimit,
}: {
  data: Row[];
  columns: string[];
  busy?: boolean;
  onRow?: (record: Row) => void;
  actions?: (record: Row) => ReactNode;
  page?: number;
  total?: number;
  limit?: number;
  onPage?: (page: number) => void;
  currency?: string;
  empty?: ReactNode;
  controls?: boolean;
  directory?: boolean;
  onLimit?: (limit: number) => void;
}) {
  const language = useLocale();
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [selection, setSelection] = useState<RowSelectionState>({});
  const definitions = useMemo<ColumnDef<Row>[]>(
    () => [
      ...(controls
        ? [
            {
              id: 'select',
              header: ({ table }) => (
                <input
                  type="checkbox"
                  aria-label={t('Select this page')}
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              ),
              cell: ({ row: r }) => (
                <input
                  type="checkbox"
                  aria-label={t('Select {0}', { '0': labelOf(r.original) })}
                  checked={r.getIsSelected()}
                  onChange={r.getToggleSelectedHandler()}
                  onClick={(e) => e.stopPropagation()}
                />
              ),
              enableHiding: false,
            } satisfies ColumnDef<Row>,
          ]
        : []),
      ...columns.map(
        (key, index) =>
          ({
            accessorKey: key,
            header:
              directory && key === 'name'
                ? t('Full name')
                : directory && key === 'createdAt'
                  ? t('Joined date')
                  : humanize(key),
            cell: ({ row: r, getValue }) =>
              directory && key === 'name' ? (
                <div className="customer-identity">
                  <span className="customer-avatar" aria-hidden="true">
                    <RecordImage
                      id={r.original.photoId ? String(r.original.photoId) : undefined}
                      alt={labelOf(r.original)}
                      fallback={labelOf(r.original)
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()}
                    />
                  </span>
                  <div>
                    <button className="record-link" onClick={() => onRow?.(r.original)}>
                      {String(getValue())}
                    </button>
                    <small>{String(r.original.reference ?? '')}</small>
                  </div>
                </div>
              ) : index === 0 && onRow ? (
                <button className="record-link" onClick={() => onRow(r.original)}>
                  <DisplayValue name={key} value={getValue()} currency={currency} />
                  <ArrowUpRight size={13} />
                </button>
              ) : (
                <DisplayValue name={key} value={getValue()} currency={currency} />
              ),
          }) satisfies ColumnDef<Row>,
      ),
      ...(actions
        ? [
            {
              id: 'actions',
              header: directory ? t('Actions') : '',
              cell: ({ row: r }) => actions(r.original),
              enableHiding: false,
            } satisfies ColumnDef<Row>,
          ]
        : []),
    ],
    // humanize reads the active locale, so headers must be rebuilt when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, controls, onRow, actions, currency, language, directory],
  );
  const table = useReactTable({
    data,
    columns: definitions,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r, index) => r.id ?? String(index),
    state: { columnVisibility: visibility, rowSelection: selection },
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setSelection,
    enableRowSelection: true,
  });
  const totalRows = total ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / limit));
  return (
    <div className={'table-container' + (directory ? ' customer-directory' : '')}>
      {controls && (
        <div className="table-options">
          <span>
            {totalRows.toLocaleString()} {t('records')}
            {Object.values(selection).filter(Boolean).length > 0 && (
              <Button
                variant="ghost"
                size="small"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    table
                      .getSelectedRowModel()
                      .rows.map((r) =>
                        String(r.original.reference ?? r.original.id ?? labelOf(r.original)),
                      )
                      .join('\n'),
                  );
                  toast.success(t('Selected references copied'));
                }}
              >
                <Copy size={13} />
                {t('Copy selected references')}
              </Button>
            )}
          </span>
          <details className="column-picker">
            <summary>
              <Columns3 size={14} />
              {t('Columns')}
            </summary>
            <div>
              {table
                .getAllLeafColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <label key={column.id}>
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                    {humanize(column.id)}
                  </label>
                ))}
            </div>
          </details>
        </div>
      )}
      {busy ? (
        <Skeleton rows={6} />
      ) : !data.length ? (
        (empty ?? (
          <EmptyState
            title={t('No records yet')}
            description={t(
              'New records will appear here. Try adjusting your filters or create your first record.',
            )}
          />
        ))
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((r) => (
                <tr key={r.id} data-selected={r.getIsSelected()}>
                  {r.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {onPage && totalRows > 0 && (
        <div className="pagination">
          <div className="pagination-summary">
            {onLimit && (
              <label className="page-size">
                {t('Rows per page')}
                <select
                  aria-label={t('Rows per page')}
                  value={limit}
                  disabled={busy}
                  onChange={(event) => {
                    setSelection({});
                    onLimit(Number(event.target.value));
                  }}
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <span>
              {t('Showing')} {Math.min((page - 1) * limit + 1, totalRows)}–
              {Math.min(page * limit, totalRows)} {t('of')} {totalRows.toLocaleString()}
            </span>
          </div>
          <div>
            <Button
              variant="secondary"
              size="small"
              disabled={page <= 1 || busy}
              onClick={() => {
                setSelection({});
                onPage(page - 1);
              }}
            >
              <ChevronLeft size={15} />
              {t('Previous')}
            </Button>
            {directory ? (
              [...new Set([1, page - 1, page, page + 1, totalPages])]
                .filter((n) => n >= 1 && n <= totalPages)
                .sort((a, b) => a - b)
                .map((n, i, pages) => (
                  <span className="page-number-group" key={n}>
                    {i > 0 && n - pages[i - 1]! > 1 && <span aria-hidden="true">…</span>}
                    <Button
                      variant={n === page ? 'primary' : 'ghost'}
                      size="small"
                      aria-current={n === page ? 'page' : undefined}
                      aria-label={t('Page {page}', { page: n })}
                      disabled={busy}
                      onClick={() => {
                        setSelection({});
                        onPage(n);
                      }}
                    >
                      {n}
                    </Button>
                  </span>
                ))
            ) : (
              <span>
                {page} / {totalPages}
              </span>
            )}
            <Button
              variant="secondary"
              size="small"
              disabled={page >= totalPages || busy}
              onClick={() => {
                setSelection({});
                onPage(page + 1);
              }}
            >
              {t('Next')}
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
