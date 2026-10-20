import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/error-messages';
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
import CustomerAccess from '../portal/CustomerAccess';
import { PortfolioLinks, PaymentStatus } from './Portfolio';
import { VerificationSummary } from '../../components/OwnershipVerification';
import { PropertyFileModal } from '../bookings/PropertyFileModal';
import '../portal/portal.css';
const hidden = new Set([
  'id',
  'updatedAt',
  'createdBy',
  'approvedBy',
  'receivedBy',
  'verifiedBy',
  'requestedBy',
  'reservationMinutes',
  'graceDays',
  'dealerId',
  'reservationId',
  'ndcId',
  'planVersionId',
  'paymentTerms',
  'projectId',
  'passwordHash',
  'identityEncrypted',
  'identityHash',
  'pushToken',
  'hash',
  'key',
  'resultKey',
  'createdTransaction',
  'bookings',
  'paymentStatus',
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
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [tab, setTab] = useState('overview');
  const [receipt, setReceipt] = useState(false);
  const [propertyFile, setPropertyFile] = useState(false);
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
    ...(resource.slug === 'customers'
      ? { refetchOnWindowFocus: 'always' as const, refetchOnMount: 'always' as const }
      : {}),
    queryFn: ({ signal }) => api<Row>(resolvePath(path, { id: record.id! }), { signal }),
  });
  const detail = query.data ?? record;
  const photos = Array.isArray(detail.photoIds)
    ? detail.photoIds
    : detail.photoId && ['projects', 'inventory'].includes(resource.slug)
      ? [detail.photoId]
      : [];
  const collections = Object.entries(detail).filter(
    ([key, value]) =>
      key !== 'photoIds' && Array.isArray(value) && value.length && !hidden.has(key),
  );
  const position = row(detail.position);
  return (
    <>
      <Modal
        open
        onOpenChange={(v) => !v && onClose()}
        title={labelOf(detail)}
        description={t('{resource} / Record details', { resource: t(resource.label) })}
        wide
      >
        <div className="record-detail">
          {resource.slug === 'bookings' && (
            <Link className="text-link" to={'/payment-plans?booking=' + record.id}>
              View payment plan
            </Link>
          )}
          <div className="detail-summary">
            <span className="detail-icon">
              <resource.icon size={23} />
            </span>
            <div>
              <h3>{labelOf(detail)}</h3>
            </div>
            <div className="detail-actions">
              {actionsFor(resource, detail)
                .filter((op) => !op.path.endsWith('/reschedule'))
                .map((op) => (
                  <Button
                    key={op.id}
                    size="small"
                    variant="secondary"
                    onClick={() =>
                      setAction({ operation: op, title: actionTitle(op, resource), record: detail })
                    }
                  >
                    {t(actionTitle(op, resource))}
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
              {t('Overview')}
            </button>
            {Object.keys(position).length > 0 && (
              <button
                role="tab"
                aria-selected={tab === 'position'}
                onClick={() => setTab('position')}
              >
                {t('Payment position')}
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
              {['inventory', 'customers'].includes(resource.slug) &&
                Array.isArray(detail.bookings) && (
                  <section className="detail-portfolio">
                    <h4>
                      {t(resource.slug === 'customers' ? 'Booked properties' : 'Current members')}
                    </h4>
                    {resource.slug === 'customers' && (
                      <PaymentStatus value={detail.paymentStatus} />
                    )}
                    <PortfolioLinks
                      record={detail}
                      kind={resource.slug as 'customers' | 'inventory'}
                    />
                  </section>
                )}
              {photos.length > 0 && (
                <section className="detail-photos" aria-label={t('Photos')}>
                  <h4>{t('Photos')}</h4>
                  <DisplayValue name="photoIds" value={photos} />
                </section>
              )}
              {resource.slug === 'customers' &&
                can('customers.portal.manage') &&
                record.id &&
                projectId && <CustomerAccess projectId={projectId} customerId={record.id} />}
              <dl className="detail-grid">
                {Object.entries(detail)
                  .filter(
                    ([k, v]) =>
                      !(k === 'photoId' && photos.length) &&
                      !hidden.has(k) &&
                      (!/Id$/.test(k) || /photoId|proofImageId/.test(k)) &&
                      v !== null &&
                      (typeof v !== 'object' || ['customer', 'unit', 'booking'].includes(k)),
                  )
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{humanize(k)}</dt>
                      <dd>
                        <DisplayValue name={k} value={v} />
                      </dd>
                    </div>
                  ))}
              </dl>
              {detail.verification != null && <VerificationSummary value={detail.verification} />}
              {resource.slug === 'users' && record.id && (
                <div className="detail-links">
                  <Link
                    className="btn btn-primary btn-small"
                    to={'/users/' + record.id}
                    onClick={onClose}
                  >
                    <ArrowUpRight size={13} />
                    {t('View user')}
                  </Link>
                </div>
              )}
              {resource.slug === 'customers' && (
                <div className="detail-links">
                  <Link
                    className="btn btn-secondary btn-small"
                    to={'/customers/' + record.id}
                    onClick={onClose}
                  >
                    <ArrowUpRight size={13} />
                    {t('View member')}
                  </Link>
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
                          toast.error(
                            e instanceof Error ? errorMessage(e) : t('Unable to reveal identity'),
                          );
                        }
                      }}
                    >
                      {identity ?? t('Reveal identity')}
                    </Button>
                  )}
                  {can('reports.read') && (
                    <Link
                      className="btn btn-secondary btn-small"
                      to={'/reports?kind=customer-statement&customerId=' + record.id}
                      onClick={onClose}
                    >
                      <FileText size={15} />
                      {t('Member statement')}
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                  {can('documents.read') && (
                    <Link
                      className="btn btn-secondary btn-small"
                      to={'/documents?customerId=' + record.id}
                      onClick={onClose}
                    >
                      {t('Member documents')}
                    </Link>
                  )}
                </div>
              )}
              {resource.slug === 'collections' && row(detail.receipt).id && can('payments.read') ? (
                <Button variant="secondary" onClick={() => setReceipt(true)}>
                  {t('View receipt')}
                </Button>
              ) : null}
              {resource.slug === 'bookings' && (
                <div className="detail-links">
                  <Button variant="secondary" size="small" onClick={() => setPropertyFile(true)}>
                    <FileText size={15} />
                    {t('Computerized Property File')}
                  </Button>
                  <Link
                    className="btn btn-secondary btn-small"
                    to={'/collections?bookingId=' + record.id}
                    onClick={onClose}
                  >
                    {t('View payments')}
                    <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    className="btn btn-secondary btn-small"
                    to={'/documents?bookingId=' + record.id}
                    onClick={onClose}
                  >
                    {t('Booking documents')}
                  </Link>
                </div>
              )}
              {detail.payload && typeof detail.payload === 'object' && (
                <div className="payload-details">
                  <h4>{t('Requested terms')}</h4>
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
                        (typeof row(asRows(values)[0])[k] !== 'object' ||
                          ['customer', 'booking', 'unit'].includes(k)),
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
                              {t('Resolve')}
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
      {propertyFile && record.id && (
        <PropertyFileModal bookingId={String(record.id)} onClose={() => setPropertyFile(false)} />
      )}
      {action && <OperationDialog {...action} onClose={() => setAction(null)} />}
    </>
  );
}
