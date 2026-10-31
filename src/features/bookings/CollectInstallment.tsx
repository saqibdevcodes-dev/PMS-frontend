import { Money } from '../../components/Money';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { t, useLocale } from '../../lib/i18n';
import { date } from '../../lib/format';
import { type Row } from '../../lib/types';
import { can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { Button, Modal, ModalClose, ErrorState, Badge } from '../../components/ui';
import { Select } from '../../components/Select';
import { RelationSelect } from '../../components/RelationSelect';
import { ImageUpload } from '../../components/ImageUpload';
import { confirmDiscard, useUnsavedChanges } from '../../hooks/use-unsaved';

export default function CollectInstallment({
  installment,
  bookingId,
  onClose,
}: {
  installment: Row;
  bookingId: string;
  onClose: () => void;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [method, setMethod] = useState('CASH'),
    [reference, setReference] = useState(''),
    [proof, setProof] = useState(''),
    [account, setAccount] = useState(''),
    [uploading, setUploading] = useState(false),
    [review, setReview] = useState(false);
  const [request] = useState(() => ({ id: crypto.randomUUID(), paidAt: new Date().toISOString() }));
  const submit = useMutation({
    mutationFn: () =>
      api<Row>(`/projects/${projectId}/installments/${installment.id}/payment`, {
        method: 'POST',
        idempotencyKey: request.id,
        body: {
          expectedAmount: String(installment.outstanding),
          method,
          paidAt: request.paidAt,
          ...(method !== 'CASH' ? { transactionReference: reference.trim() } : {}),
          ...(method === 'BANK_TRANSFER'
            ? { proofImageId: proof, receivingAccountId: account }
            : {}),
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
  const valid =
    method === 'CASH'
      ? can('payments.verify')
      : reference.trim().length > 0 && (method !== 'BANK_TRANSFER' || Boolean(proof && account));
  useUnsavedChanges(
    !submit.isSuccess && Boolean(review || reference || proof || account || method !== 'CASH'),
  );
  const uncertain = submit.error instanceof ApiError && submit.error.status === 0;
  return (
    <Modal
      open
      title={t(submit.isSuccess ? 'Payment recorded' : 'Receive installment')}
      onOpenChange={(open) => !open && onClose()}
      beforeClose={async () => !submit.isPending && (submit.isSuccess || (await confirmDiscard()))}
    >
      <div className="modal-body">
        <div className="installment-collection-summary">
          <span>{String(installment.label)}</span>
          <strong>
            <Money value={installment.outstanding} />
          </strong>
          <small>
            {t('Due date')}: {date(installment.dueDate)}
          </small>
        </div>
        {submit.isSuccess ? (
          <>
            <Badge value={submit.data.status} />
            <p>
              {t(
                submit.data.status === 'CLEARED'
                  ? 'Cash is approved, the receipt is issued and the installment balance is updated.'
                  : 'Payment is pending verification. Another authorised staff member must clear it from Payments received.',
              )}
            </p>
            <div className="form-footer">
              <Button asChild variant="secondary">
                <Link to={'/collections?bookingId=' + bookingId} onClick={onClose}>
                  {t('View payment')}
                </Link>
              </Button>
              <ModalClose asChild>
                <Button>{t('Done')}</Button>
              </ModalClose>
            </div>
          </>
        ) : (
          <>
            {!review ? (
              <div className="form-grid">
                <label className="form-field form-full">
                  {t('Payment method')}
                  <Select
                    value={method}
                    onChange={(v) => {
                      setMethod(v);
                      submit.reset();
                    }}
                    options={[
                      { value: 'CASH', label: t('Cash') },
                      { value: 'CHEQUE', label: t('Cheque') },
                      { value: 'BANK_TRANSFER', label: t('Bank transfer') },
                    ]}
                  />
                </label>
                {method !== 'CASH' && (
                  <label className="form-field form-full">
                    {t(method === 'CHEQUE' ? 'Cheque number' : 'Bank transaction ID')}
                    <input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      maxLength={200}
                      required
                    />
                  </label>
                )}
                {method === 'BANK_TRANSFER' && (
                  <>
                    <label className="form-field form-full">
                      {t('Receiving bank account')}
                      <RelationSelect name="accountId" value={account} onChange={setAccount} />
                    </label>
                    <div className="form-field form-full">
                      <ImageUpload
                        value={proof}
                        onChange={setProof}
                        purpose="PAYMENT"
                        label={t('Bank transfer screenshot')}
                        required
                        onBusy={setUploading}
                      />
                    </div>
                  </>
                )}
                {method === 'CASH' && !can('payments.verify') && (
                  <p className="form-full">
                    {t(
                      'Payment verification permission is required to approve cash. Ask an authorised staff member.',
                    )}
                  </p>
                )}
              </div>
            ) : (
              <dl className="review-values">
                <div>
                  <dt>{t('Payment method')}</dt>
                  <dd>
                    {t(
                      method === 'CASH' ? 'Cash' : method === 'CHEQUE' ? 'Cheque' : 'Bank transfer',
                    )}
                  </dd>
                </div>
                {reference && method !== 'CASH' && (
                  <div>
                    <dt>{t('Reference')}</dt>
                    <dd>{reference}</dd>
                  </div>
                )}
              </dl>
            )}
            {method !== 'CASH' && (
              <p className="muted">
                {t(
                  'Cheque and bank payments stay pending until another authorised staff member verifies the funds.',
                )}
              </p>
            )}
            {submit.error && <ErrorState error={submit.error} />}
            <div className="form-footer">
              {review ? (
                <Button
                  variant="secondary"
                  disabled={submit.isPending || uncertain}
                  onClick={() => setReview(false)}
                >
                  {t('Back to details')}
                </Button>
              ) : (
                <ModalClose asChild>
                  <Button variant="secondary" disabled={submit.isPending}>
                    {t('Cancel')}
                  </Button>
                </ModalClose>
              )}
              <Button
                disabled={!valid || uploading}
                busy={submit.isPending}
                onClick={() => (review ? submit.mutate() : setReview(true))}
              >
                {t(
                  uncertain
                    ? 'Retry the same request'
                    : !review
                      ? 'Review payment'
                      : method === 'CASH'
                        ? 'Record & approve cash'
                        : 'Record for verification',
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
