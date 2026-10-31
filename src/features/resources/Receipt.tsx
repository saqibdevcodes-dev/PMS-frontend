import { Money } from '../../components/Money';
import { errorMessage } from '../../lib/error-messages';
import { t, useLocale } from '../../lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { ProjectLogo } from '../../components/ProjectLogo';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { row, type Row } from '../../lib/types';
import { date, humanize } from '../../lib/format';
import { usePreferences } from '../../stores/preferences';
import { print } from '../../platform/adapter';
import { Modal, Button, Badge, ErrorState, Skeleton } from '../../components/ui';
export function Receipt({ id, onClose }: { id: string; onClose: () => void }) {
  useLocale();
  const { projectId, projectName } = usePreferences();
  const receipt = useQuery({
    queryKey: ['receipt', projectId, id],
    queryFn: ({ signal }) => api<Row>(`/projects/${projectId}/receipts/${id}`, { signal }),
  });
  const payment = row(receipt.data?.payment);
  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title={t('Payment receipt')}
      description={t('Payment receipt issued after verification.')}
    >
      <div className="modal-body printable-receipt">
        {receipt.isLoading ? (
          <Skeleton />
        ) : receipt.isError ? (
          <ErrorState error={receipt.error} />
        ) : (
          <>
            <div className="receipt-brand">
              <ProjectLogo projectId={projectId} name={projectName} />
              <div>
                <h2>{projectName}</h2>
                <p>{String(receipt.data?.reference ?? 'Receipt')}</p>
              </div>
              <Badge
                value={receipt.data?.status ?? (receipt.data?.reversedAt ? 'REVERSED' : 'ISSUED')}
              />
            </div>
            <div className="receipt-amount">
              <Money value={payment.amount} />
            </div>
            <dl className="detail-grid">
              <div>
                <dt>{t('Payment method')}</dt>
                <dd>{humanize(String(payment.method))}</dd>
              </div>
              <div>
                <dt>{t('Paid on')}</dt>
                <dd>{date(payment.paidAt)}</dd>
              </div>
              <div>
                <dt>{t('Booking number')}</dt>
                <dd className="record-id">{String(row(payment.booking).reference ?? '\u2014')}</dd>
              </div>
              <div>
                <dt>{t('Customer')}</dt>
                <dd className="record-id">
                  {String(row(row(payment.booking).customer).name ?? '\u2014')}
                </dd>
              </div>
              <div>
                <dt>{t('Issued on')}</dt>
                <dd>{date(receipt.data?.issuedAt ?? receipt.data?.createdAt)}</dd>
              </div>
            </dl>
            {Boolean(receipt.data?.reversedAt) && (
              <p className="field-error">
                {t(
                  'This receipt has been reversed and is no longer evidence of a cleared collection.',
                )}
              </p>
            )}
            <Button
              onClick={() =>
                void Promise.resolve(print()).catch((e: Error) => toast.error(errorMessage(e)))
              }
            >
              <Printer size={16} />
              {t('Print receipt')}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
