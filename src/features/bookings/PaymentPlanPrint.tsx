import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Money } from '../../components/Money';
import { ProjectLogo } from '../../components/ProjectLogo';
import { SignatureFooter } from '../../components/SignatureFooter';
import { Button, Modal, ErrorState } from '../../components/ui';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/error-messages';
import { bookingIdentity, date } from '../../lib/format';
import { t, useLocale } from '../../lib/i18n';
import { asRows, row, type Row } from '../../lib/types';
import { print } from '../../platform/adapter';
import { can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { Receipt } from '../resources/Receipt';

type InstallmentReceipt = {
  id: string;
  amount: string;
  payment: { paidAt: string; receipt: { id: string; reference: string } | null };
};

export function PaymentPlanPrint({
  booking,
  installment,
  onClose,
}: {
  booking: Row;
  installment?: Row | null;
  onClose: () => void;
}) {
  useLocale();
  const { projectId, projectName } = usePreferences();
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const receipts = useQuery({
    queryKey: ['installment-receipts', projectId, installment?.id],
    enabled: Boolean(projectId && installment?.id && can('payments.read')),
    queryFn: ({ signal }) =>
      api<InstallmentReceipt[]>(`/projects/${projectId}/installments/${installment?.id}/receipts`, {
        signal,
      }),
  });
  if (receiptId) return <Receipt id={receiptId} onClose={() => setReceiptId(null)} />;
  const position = row(booking.position);
  const customer = row(booking.customer);
  const unit = row(booking.unit);
  const title = installment ? t('Installment voucher') : t('Payment plan');
  return (
    <Modal open wide title={title} onOpenChange={(open) => !open && onClose()}>
      <div className="modal-body printable-receipt payment-print-sheet">
        <header className="receipt-brand">
          <ProjectLogo projectId={projectId} name={projectName} />
          <div>
            <h2>{projectName}</h2>
            <p>{title}</p>
          </div>
        </header>
        <h2>{bookingIdentity(booking)?.title ?? String(unit.number ?? booking.reference)}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{t('Customer')}</dt>
            <dd>{String(customer.name ?? '—')}</dd>
          </div>
          <div>
            <dt>{t('Booking number')}</dt>
            <dd>{String(booking.reference ?? '—')}</dd>
          </div>
          <div>
            <dt>{t('Property')}</dt>
            <dd>{String(unit.number ?? '—')}</dd>
          </div>
          <div>
            <dt>{t('Status')}</dt>
            <dd>{t(String(booking.status ?? '—'))}</dd>
          </div>
          {installment && (
            <>
              <div>
                <dt>{t('Installment')}</dt>
                <dd>{String(installment.label)}</dd>
              </div>
              <div>
                <dt>{t('Due date')}</dt>
                <dd>{date(installment.dueDate)}</dd>
              </div>
            </>
          )}
        </dl>
        {installment ? (
          <dl className="detail-grid payment-print-totals">
            <div>
              <dt>{t('Amount')}</dt>
              <dd>
                <Money value={installment.amount} />
              </dd>
            </div>
            <div>
              <dt>{t('Paid')}</dt>
              <dd>
                <Money value={installment.paid} />
              </dd>
            </div>
            <div>
              <dt>{t('Remaining balance')}</dt>
              <dd>
                <Money value={installment.outstanding} />
              </dd>
            </div>
          </dl>
        ) : (
          <>
            <dl className="detail-grid payment-print-totals">
              <div>
                <dt>{t('Total price')}</dt>
                <dd>
                  <Money value={booking.total} />
                </dd>
              </div>
              <div>
                <dt>{t('Verified payments')}</dt>
                <dd>
                  <Money value={position.collected} />
                </dd>
              </div>
              <div>
                <dt>{t('Remaining balance')}</dt>
                <dd>
                  <Money value={position.outstanding} />
                </dd>
              </div>
            </dl>
            <table className="payment-print-table">
              <thead>
                <tr>
                  <th>{t('Installment')}</th>
                  <th>{t('Due date')}</th>
                  <th>{t('Amount')}</th>
                  <th>{t('Paid')}</th>
                  <th>{t('Remaining balance')}</th>
                </tr>
              </thead>
              <tbody>
                {asRows(position.installments).map((item) => (
                  <tr key={String(item.id)}>
                    <td>{String(item.label)}</td>
                    <td>{date(item.dueDate)}</td>
                    <td>
                      <Money value={item.amount} />
                    </td>
                    <td>
                      <Money value={item.paid} />
                    </td>
                    <td>
                      <Money value={item.outstanding} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <SignatureFooter labels={['Customer signature', 'Received by', 'Authorized Approval']} />
        {installment && can('payments.read') && (
          <div className="payment-print-receipts">
            {receipts.isError && (
              <ErrorState error={receipts.error} retry={() => void receipts.refetch()} />
            )}
            {!!receipts.data?.length && (
              <>
                <h3>{t('Issued receipts')}</h3>
                {receipts.data.map(
                  ({ id, amount, payment }) =>
                    payment.receipt && (
                      <Button
                        key={id}
                        variant="secondary"
                        size="small"
                        onClick={() => setReceiptId(payment.receipt!.id)}
                      >
                        {payment.receipt.reference} · {date(payment.paidAt)} ·{' '}
                        <Money value={amount} />
                      </Button>
                    ),
                )}
              </>
            )}
          </div>
        )}
        <div className="payment-print-actions">
          <Button
            onClick={() =>
              void Promise.resolve(print()).catch((error: Error) =>
                toast.error(errorMessage(error)),
              )
            }
          >
            <Printer size={16} /> {t('Print')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
