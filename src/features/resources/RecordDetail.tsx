import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { operations, resolvePath, operation, projectRoot } from '../../lib/contract';
import { asRows, row, type Row, type Operation } from '../../lib/types';
import { labelOf, humanize } from '../../lib/format';
import { can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { type Resource, resourcePath, actionsFor, actionTitle } from './catalog';
import { Button, Modal, Skeleton, ErrorState } from '../../components/ui';
import { DataTable, DisplayValue } from '../../components/DataTable';
import { Receipt } from './Receipt';
import { OperationDialog } from '../../components/OperationDialog';
const hidden = new Set([
  'projectId',
  'passwordHash',
  'identityEncrypted',
  'identityHash',
  'pushToken',
  'hash',
  'key',
  'resultKey',
  'createdTransaction',
]);
export default function RecordDetail({
  resource,
  record,
  onClose,
}: {
  resource: Resource;
  record: Row;
  onClose: () => void;
}) {
  const projectId = usePreferences((s) => s.projectId);
  const [tab, setTab] = useState('overview');
  const [receipt, setReceipt] = useState(false);
  const [action, setAction] = useState<{
    operation: Operation;
    title: string;
    record?: Row;
  } | null>(null);
  const [identity, setIdentity] = useState<string>();
  const path = resourcePath(resource) + '/{id}';
  const hasDetail = operations.some((o) => o.path === path && o.method === 'get');
  const query = useQuery({
    queryKey: ['detail', projectId, resource.slug, record.id],
    enabled: hasDetail && !!record.id,
    queryFn: ({ signal }) => api<Row>(resolvePath(path, { id: record.id! }), { signal }),
  });
  const detail = query.data ?? record;
  const collections = Object.entries(detail).filter(
    ([key, value]) => Array.isArray(value) && value.length && !hidden.has(key),
  );
  const position = row(detail.position);
  return (
    <>
      <Modal
        open
        onOpenChange={(v) => !v && onClose()}
        title={labelOf(detail)}
        description={resource.label + ' / Record details'}
        wide
      >
        <div className="record-detail">
          <div className="detail-summary">
            <span className="detail-icon">
              <resource.icon size={23} />
            </span>
            <div>
              <h3>{labelOf(detail)}</h3>
              <span className="record-id">{record.id}</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy record ID"
              onClick={async () => {
                await navigator.clipboard.writeText(record.id ?? '');
                toast.success('Record ID copied');
              }}
            >
              <Copy size={16} />
            </Button>
            <div className="detail-actions">
              {actionsFor(resource, detail).map((op) => (
                <Button
                  key={op.id}
                  size="small"
                  variant="secondary"
                  onClick={() =>
                    setAction({ operation: op, title: actionTitle(op, resource), record: detail })
                  }
                >
                  {actionTitle(op, resource)}
                </Button>
              ))}
            </div>
          </div>
          <div className="tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'overview'}
              onClick={() => setTab('overview')}
            >
              Overview
            </button>
            {Object.keys(position).length > 0 && (
              <button
                role="tab"
                aria-selected={tab === 'position'}
                onClick={() => setTab('position')}
              >
                Payment position
              </button>
            )}
            {collections.map(([key]) => (
              <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
                {humanize(key)}
              </button>
            ))}
          </div>
          {query.isError ? (
            <ErrorState error={query.error} retry={() => void query.refetch()} />
          ) : query.isLoading && hasDetail ? (
            <Skeleton />
          ) : tab === 'overview' ? (
            <>
              <dl className="detail-grid">
                {Object.entries(detail)
                  .filter(([k, v]) => !hidden.has(k) && v !== null && typeof v !== 'object')
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{humanize(k)}</dt>
                      <dd>
                        <DisplayValue name={k} value={v} />
                      </dd>
                    </div>
                  ))}
              </dl>
              {resource.slug === 'customers' && (
                <div className="detail-links">
                  {can('customers.view_sensitive') && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={async () => {
                        try {
                          const r = await api<{ identity: string }>(
                            resolvePath(projectRoot + '/customers/{id}/identity', {
                              id: record.id!,
                            }),
                          );
                          setIdentity(r.identity);
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : 'Unable to reveal identity');
                        }
                      }}
                    >
                      {identity ?? 'Reveal identity'}
                    </Button>
                  )}
                  {can('reports.read') && (
                    <Link
                      className="btn btn-secondary btn-small"
                      to={'/reports?kind=customer-statement&customerId=' + record.id}
                      onClick={onClose}
                    >
                      <FileText size={15} />
                      Customer statement
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                  {can('documents.read') && (
                    <Link
                      className="btn btn-secondary btn-small"
                      to={'/documents?customerId=' + record.id}
                      onClick={onClose}
                    >
                      Customer documents
                    </Link>
                  )}
                </div>
              )}
              {resource.slug === 'collections' && row(detail.receipt).id && can('payments.read') ? (
                <Button variant="secondary" onClick={() => setReceipt(true)}>
                  View receipt
                </Button>
              ) : null}
              {resource.slug === 'bookings' && (
                <div className="detail-links">
                  <Link
                    className="btn btn-secondary btn-small"
                    to={'/collections?bookingId=' + record.id}
                    onClick={onClose}
                  >
                    View payments
                    <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    className="btn btn-secondary btn-small"
                    to={'/documents?bookingId=' + record.id}
                    onClick={onClose}
                  >
                    Booking documents
                  </Link>
                </div>
              )}
              {detail.payload && typeof detail.payload === 'object' && (
                <div className="payload-details">
                  <h4>Requested terms</h4>
                  <dl className="detail-grid">
                    {Object.entries(row(detail.payload))
                      .filter(([, v]) => typeof v !== 'object')
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{humanize(k)}</dt>
                          <dd>
                            <DisplayValue name={k} value={v} />
                          </dd>
                        </div>
                      ))}
                  </dl>
                  {Object.entries(row(detail.payload))
                    .filter(([, v]) => Array.isArray(v))
                    .map(([k, v]) => (
                      <div key={k}>
                        <h4>{humanize(k)}</h4>
                        <DataTable
                          data={asRows(v)}
                          columns={Object.keys(row(asRows(v)[0]))
                            .filter((key) => !hidden.has(key))
                            .slice(0, 8)}
                          controls={false}
                        />
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : tab === 'position' ? (
            <>
              <div className="position-cards">
                {['collected', 'outstanding', 'overdue', 'unallocated'].map((key) => (
                  <div key={key}>
                    <span>{humanize(key)}</span>
                    <strong>
                      <DisplayValue name={key} value={position[key]} />
                    </strong>
                  </div>
                ))}
              </div>
              <DataTable
                data={asRows(position.installments)}
                columns={['label', 'dueDate', 'amount', 'paid', 'outstanding', 'overdue']}
                controls={false}
              />
            </>
          ) : (
            collections
              .filter(([key]) => key === tab)
              .map(([key, values]) => (
                <DataTable
                  key={key}
                  data={asRows(values)}
                  columns={Object.keys(row(asRows(values)[0]))
                    .filter(
                      (k) =>
                        !hidden.has(k) &&
                        k !== 'id' &&
                        typeof row(asRows(values)[0])[k] !== 'object',
                    )
                    .slice(0, 8)}
                  controls={false}
                  actions={
                    key === 'snags' && can('possession.manage')
                      ? (snag) =>
                          !snag.resolvedAt && (
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() =>
                                setAction({
                                  operation: operation('post', projectRoot + '/snags/{id}/resolve'),
                                  title: 'Resolve snag',
                                  record: snag,
                                })
                              }
                            >
                              Resolve
                            </Button>
                          )
                      : undefined
                  }
                />
              ))
          )}
        </div>
      </Modal>
      {receipt && <Receipt id={String(row(detail.receipt).id)} onClose={() => setReceipt(false)} />}
      {action && <OperationDialog {...action} onClose={() => setAction(null)} />}
    </>
  );
}
