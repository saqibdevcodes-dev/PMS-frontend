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
  if (value === null || value === undefined || value === '')
    return <span className="muted">—</span>;
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
          .join(', ') || 'No roles'}
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
}) {
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
                  aria-label="Select this page"
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              ),
              cell: ({ row: r }) => (
                <input
                  type="checkbox"
                  aria-label={`Select ${labelOf(r.original)}`}
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
            header: humanize(key),
            cell: ({ row: r, getValue }) =>
              index === 0 && onRow ? (
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
              header: '',
              cell: ({ row: r }) => actions(r.original),
              enableHiding: false,
            } satisfies ColumnDef<Row>,
          ]
        : []),
    ],
    [columns, controls, onRow, actions, currency],
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
    <div className="table-container">
      {controls && (
        <div className="table-options">
          <span>
            {totalRows.toLocaleString()} records
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
                  toast.success('Selected references copied');
                }}
              >
                <Copy size={13} />
                Copy selected references
              </Button>
            )}
          </span>
          <details className="column-picker">
            <summary>
              <Columns3 size={14} />
              Columns
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
            title="No records yet"
            description="New records will appear here. Try adjusting your filters or create your first record."
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
          <span>
            Showing {Math.min((page - 1) * limit + 1, totalRows)}–
            {Math.min(page * limit, totalRows)} of {totalRows.toLocaleString()}
          </span>
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
              Previous
            </Button>
            <span>
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="small"
              disabled={page >= totalPages || busy}
              onClick={() => {
                setSelection({});
                onPage(page + 1);
              }}
            >
              Next
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
