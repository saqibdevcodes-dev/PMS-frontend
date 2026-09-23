import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { resources, resourcePath, actionsFor, actionTitle } from './catalog';
import { operations, projectRoot, resolvePath } from '../../lib/contract';
import { api, queryString } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { platform, scanCode } from '../../platform/adapter';
import { toast } from 'sonner';
import { asRows, row, type Row, type Page, type Operation } from '../../lib/types';
import { humanize, labelOf, money } from '../../lib/format';
import { Button, PageHeading, ErrorState, EmptyState, Badge } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { OperationDialog } from '../../components/OperationDialog';
import RecordDetail from './RecordDetail';
export function ProjectRequired() {
  return (
    <div className="panel">
      <EmptyState
        title="Your next project starts here"
        description="Choose a project from the sidebar, or create your first development to bring your workspace to life."
        action={
          <Button asChild>
            <Link to="/projects">
              <Plus size={16} />
              Explore projects
            </Link>
          </Button>
        }
      />
    </div>
  );
}
export function Unauthorized() {
  return (
    <ErrorState
      error={
        new Error(
          'Your role does not have access to this workspace. Ask an administrator to update your permissions.',
        )
      }
    />
  );
}
export default function ResourcePage({ slug }: { slug: string }) {
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
  const path = resource.report ? projectRoot + '/reports' : resourcePath(resource);
  const get = operations.find((op) => op.path === path && op.method === 'get');
  const queryParams = useMemo(
    () => new Set(get?.parameters.filter((p) => p.in === 'query').map((p) => p.name)),
    [get],
  );
  const page = Number(params.get('page') || 1);
  const limit = 25;
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
      const records = resource.report ? asRows(row(query.data).rows) : asRows(query.data);
      const found = records.find((r) => r.id === id);
      setDetail(found ?? { id });
    }
  }, [params, query.data, resource.report]);
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
      'crm',
      'customers',
      'bookings',
      'dealers',
      'vendors',
      'payment-plans',
      'document-templates',
    ].includes(slug);
  function rowActions(record: Row) {
    const allowed = actionsFor(resource, record);
    return (
      <div className="row-actions">
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
            Open workspace
            <ArrowUpRight size={14} />
          </Button>
        )}
        {allowed.length > 0 && (
          <details className="actions-menu">
            <summary aria-label={`Actions for ${labelOf(record)}`}>
              <MoreHorizontal size={18} />
            </summary>
            <div>
              {allowed.map((op) => (
                <button
                  key={op.id}
                  onClick={() =>
                    setAction({ operation: op, title: actionTitle(op, resource), record })
                  }
                >
                  {actionTitle(op, resource)}
                </button>
              ))}
            </div>
          </details>
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
              aria-label="Refresh records"
              onClick={() => void query.refetch()}
            >
              <RefreshCw size={16} className={query.isFetching ? 'spin' : ''} />
            </Button>
            {slug === 'bookings' && can('bookings.create') && (
              <Button asChild>
                <Link to="/bookings/new">
                  <Plus size={17} />
                  New booking
                </Link>
              </Button>
            )}
            {createActions.map((op) => (
              <Button
                key={op.id}
                variant={op.path === resourcePath(resource) ? 'primary' : 'secondary'}
                onClick={() => setAction({ operation: op, title: actionTitle(op, resource) })}
              >
                <Plus size={16} />
                {actionTitle(op, resource)}
              </Button>
            ))}
          </>
        }
      />
      {related.length > 0 && (
        <div className="module-links">
          {related.map((r) => (
            <Link to={'/' + r.slug} key={r.slug}>
              {r.label}
              <ArrowUpRight size={12} />
            </Link>
          ))}
        </div>
      )}
      <section className="panel">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            {showSearch && (
              <div className="input-icon">
                <Search size={16} />
                <input
                  aria-label={`Search ${resource.label}`}
                  placeholder={`Search ${resource.label.toLowerCase()}…`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            {statuses && (
              <select
                aria-label="Filter by status"
                value={params.get('status') ?? ''}
                onChange={(e) => update('status', e.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {humanize(String(s))}
                  </option>
                ))}
              </select>
            )}
            {slug === 'inventory' && (
              <input
                aria-label="Filter by phase"
                placeholder="Phase"
                value={params.get('phase') ?? ''}
                onChange={(e) => update('phase', e.target.value)}
              />
            )}
            <select
              aria-label="Sort order"
              value={params.get('sort') ?? 'desc'}
              onChange={(e) => update('sort', e.target.value)}
              disabled={!queryParams.has('sort')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          {resource.views && (
            <div className="segmented">
              {slug === 'inventory' && (
                <button
                  aria-label="Matrix view"
                  aria-pressed={view === 'matrix'}
                  onClick={() => update('view', 'matrix')}
                >
                  <Grid3X3 size={17} />
                </button>
              )}
              {platform.mobile && (
                <button
                  aria-label="Scan property reference"
                  onClick={() =>
                    void scanCode()
                      .then(setSearch)
                      .catch((e: Error) => toast.error(e.message))
                  }
                >
                  <ScanLine size={17} />
                </button>
              )}
              <button
                aria-label="Table view"
                aria-pressed={view === 'table'}
                onClick={() => update('view', 'table')}
              >
                <List size={17} />
              </button>
              <button
                aria-label={slug === 'crm' ? 'Pipeline view' : 'Card view'}
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
              Showing the current page of {total} units. Filter by phase or status to narrow the
              matrix.
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
          slug === 'crm' ? (
            <div className="pipeline">
              {['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'].map((status) => (
                <div className="pipeline-column" key={status}>
                  <h3>
                    {humanize(status)}
                    <span>{dataItems.filter((r) => r.status === status).length}</span>
                  </h3>
                  {dataItems
                    .filter((r) => r.status === status)
                    .map((r) => (
                      <button className="pipeline-card" key={r.id} onClick={() => setDetail(r)}>
                        <strong>{labelOf(r)}</strong>
                        <span>{String(r.phone)}</span>
                        <small>{String(r.source)}</small>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="inventory-grid">
              {dataItems.map((r) => (
                <button className="unit-card" key={r.id} onClick={() => setDetail(r)}>
                  <div>
                    <resource.icon size={21} />
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
                    <strong>{money(r.price)}</strong>
                  </footer>
                </button>
              ))}
            </div>
          )
        ) : (
          <DataTable
            data={dataItems}
            columns={resource.columns}
            busy={query.isLoading}
            onRow={setDetail}
            actions={rowActions}
            page={page}
            total={total}
            limit={limit}
            onPage={(p) => update('page', String(p))}
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
            Previous page
          </Button>
          <span>
            Page {page} · {total} records
          </span>
          <Button
            variant="secondary"
            disabled={page * limit >= total}
            onClick={() => update('page', String(page + 1))}
          >
            Next page
          </Button>
        </div>
      )}
      {detail && (
        <RecordDetail
          resource={resource}
          record={detail}
          onClose={() => {
            setDetail(null);
            if (params.has('record')) update('record', '');
          }}
        />
      )}
      {action && <OperationDialog {...action} onClose={() => setAction(null)} />}
    </>
  );
}
