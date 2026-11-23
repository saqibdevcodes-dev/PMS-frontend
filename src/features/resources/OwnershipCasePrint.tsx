import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Money } from '../../components/Money';
import { ProjectLogo } from '../../components/ProjectLogo';
import { SignatureFooter } from '../../components/SignatureFooter';
import { Badge, Button, ErrorState, Modal, Skeleton } from '../../components/ui';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/error-messages';
import { date } from '../../lib/format';
import { t, useLocale } from '../../lib/i18n';
import { print } from '../../platform/adapter';
import { usePreferences } from '../../stores/preferences';

export type OwnershipCaseKind = 'transfers' | 'possessions';

type Owner = {
  share: string;
  validTo: string | null;
  customer: { name: string };
};

export type CaseRecord = {
  id: string;
  reference?: string;
  status: string;
  completedAt?: string | null;
  charges?: string;
  paidAt?: string | null;
  paymentReference?: string | null;
  buyer?: { name: string };
  inspectionAt?: string | null;
  inspectionNotes?: string | null;
  handoverAt?: string | null;
  handoverReference?: string | null;
  receivedByName?: string | null;
  booking: {
    reference: string;
    customer: { name: string };
    owners: Owner[];
    unit: {
      number: string;
      project: { name: string; logoId: string | null; company?: { name: string } | null };
    };
  };
};

export function ownerNames(record: CaseRecord, kind: OwnershipCaseKind) {
  const owners = record.booking.owners.filter((owner) =>
    kind === 'transfers' && record.status === 'COMPLETED' && record.completedAt
      ? owner.validTo &&
        new Date(owner.validTo).getTime() === new Date(record.completedAt).getTime()
      : !owner.validTo,
  );
  return (
    owners.map((owner) => owner.customer.name).join(', ') ||
    (kind === 'possessions' || record.status !== 'COMPLETED' ? record.booking.customer.name : '—')
  );
}

export function OwnershipCasePrint({
  kind,
  id,
  onClose,
}: {
  kind: OwnershipCaseKind;
  id: string;
  onClose: () => void;
}) {
  useLocale();
  const projectId = usePreferences((state) => state.projectId);
  const query = useQuery({
    queryKey: ['ownership-case-print', projectId, kind, id],
    enabled: Boolean(projectId && id),
    queryFn: ({ signal }) => api<CaseRecord>(`/projects/${projectId}/${kind}/${id}`, { signal }),
  });
  const record = query.data;
  const transfer = kind === 'transfers';
  const complete = record?.status === 'COMPLETED';
  const title = transfer
    ? t(complete ? 'Ownership transfer certificate' : 'Transfer request')
    : t(complete ? 'Possession handover certificate' : 'Possession request');
  const project = record?.booking.unit.project;
  const parties = record ? ownerNames(record, kind) : '';
  return (
    <Modal open wide title={title} onOpenChange={(open) => !open && onClose()}>
      <div className="modal-body printable-receipt ownership-print-sheet">
        {query.isLoading ? (
          <Skeleton />
        ) : query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : record && project ? (
          <>
            <header className="receipt-brand">
              <ProjectLogo logoId={project.logoId} name={project.name} />
              <div>
                {project.company?.name && <strong>{project.company.name}</strong>}
                <h2>{project.name}</h2>
                <p>{t('Customer copy')}</p>
              </div>
              <Badge value={record.status} />
            </header>
            <h1>{title}</h1>
            <p className="ownership-print-status">
              {t(
                complete
                  ? transfer
                    ? 'Ownership transfer completed.'
                    : 'Property possession handed over.'
                  : transfer
                    ? 'Transfer is pending. Ownership has not changed yet.'
                    : 'Possession is pending. Property handover has not been completed.',
              )}
            </p>
            <dl className="detail-grid">
              {transfer && (
                <div>
                  <dt>{t('Transfer reference')}</dt>
                  <dd>{record.reference ?? '—'}</dd>
                </div>
              )}
              <div>
                <dt>{t('Booking number')}</dt>
                <dd>{record.booking.reference}</dd>
              </div>
              <div>
                <dt>{t('Property')}</dt>
                <dd>{record.booking.unit.number}</dd>
              </div>
              <div>
                <dt>{t('Status')}</dt>
                <dd>{t(record.status)}</dd>
              </div>
              {transfer ? (
                <>
                  <div>
                    <dt>{t('Previous owner')}</dt>
                    <dd>{parties}</dd>
                  </div>
                  <div>
                    <dt>{t('New owner')}</dt>
                    <dd>{record.buyer?.name ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t('Transfer charges')}</dt>
                    <dd>
                      <Money value={record.charges ?? '0'} />
                    </dd>
                  </div>
                  {record.paymentReference && (
                    <div>
                      <dt>{t('Payment reference')}</dt>
                      <dd>{record.paymentReference}</dd>
                    </div>
                  )}
                  {record.completedAt && (
                    <div>
                      <dt>{t('Completed on')}</dt>
                      <dd>{date(record.completedAt)}</dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <dt>{t('Customer')}</dt>
                    <dd>{parties}</dd>
                  </div>
                  {record.inspectionAt && (
                    <div>
                      <dt>{t('Inspection date')}</dt>
                      <dd>{date(record.inspectionAt)}</dd>
                    </div>
                  )}
                  {record.handoverAt && (
                    <div>
                      <dt>{t('Handover date')}</dt>
                      <dd>{date(record.handoverAt)}</dd>
                    </div>
                  )}
                  {record.handoverReference && (
                    <div>
                      <dt>{t('Handover reference')}</dt>
                      <dd>{record.handoverReference}</dd>
                    </div>
                  )}
                  {record.receivedByName && (
                    <div>
                      <dt>{t('Received by')}</dt>
                      <dd>{record.receivedByName}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            <small className="ownership-print-generated">
              {t('Generated on {0}', { '0': date(new Date()) })}
            </small>
            <SignatureFooter
              labels={
                transfer
                  ? [
                      'Previous owner signature',
                      'New owner signature',
                      'Authorized Project Officer',
                    ]
                  : ['Customer signature', 'Handed over by', 'Authorized Project Officer']
              }
            />
            <div className="ownership-print-actions">
              <Button
                onClick={() =>
                  void Promise.resolve(print()).catch((error: Error) =>
                    toast.error(errorMessage(error)),
                  )
                }
              >
                <Printer size={16} /> {t('Print customer copy')}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
