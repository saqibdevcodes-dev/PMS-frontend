import { Link } from 'react-router-dom';
import { t, useLocale } from '../lib/i18n';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../lib/api';
import { resolvePath } from '../lib/contract';
import { queryClient } from '../lib/query';
import { humanize, money } from '../lib/format';
import { row, type Operation, type Row } from '../lib/types';
import { Button, Modal, ModalClose, ErrorState, Badge } from './ui';
import { SchemaForm } from './SchemaForm';
import { JobStatus } from './JobStatus';
import { useUnsavedChanges, confirmDiscard } from '../hooks/use-unsaved';
import { CsvImport } from './CsvImport';
import { DataTable } from './DataTable';
import { asRows } from '../lib/types';
import { VerificationSummary, OwnershipParties } from './OwnershipVerification';
export function OperationDialog({
  operation,
  title,
  record,
  initial,
  onClose,
  onSuccess,
}: {
  operation: Operation;
  title: string;
  record?: Row;
  initial?: Row;
  onClose: () => void;
  onSuccess?: (value: unknown) => void;
}) {
  useLocale();
  const [review, setReview] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>();
  function prepare(values: Row) {
    mutation.reset();
    setDraft(values);
    setReview(values);
  }
  const [key] = useState(() => crypto.randomUUID());
  const [done, setDone] = useState<unknown>();
  const [customerLoginEnabled, setCustomerLoginEnabled] = useState(false);
  const customerCreate = operation.method === 'post' && operation.path.endsWith('/customers');
  const bodySchema = operation.body ?? { type: 'object', properties: {} };
  const confirmationOnly =
    bodySchema.type === 'object' &&
    !Object.keys(bodySchema.properties ?? {}).length &&
    !bodySchema.anyOf &&
    !bodySchema.allOf &&
    !bodySchema.$ref;
  const bookingConfirmation = operation.path.endsWith('/bookings/{id}/confirm');
  const reviewValues = confirmationOnly
    ? Object.fromEntries(
        Object.entries({
          [bookingConfirmation ? 'Booking number' : 'Reference']: record?.reference,
          Name: record?.name ?? record?.title ?? record?.number,
          Member: row(record?.customer).name,
          Property: row(record?.unit).number,
          Booking: row(record?.booking).reference,
          'New owner': row(record?.buyer).name,
          verification: record?.verification,
          'Payment type': record?.paymentType ? humanize(String(record.paymentType)) : undefined,
          Amount: record?.amount == null ? undefined : money(record.amount),
          'Total payable': record?.total == null ? undefined : money(record.total),
        }).filter(([, value]) => value != null && value !== ''),
      )
    : (review ?? {});
  useUnsavedChanges(Boolean(review) && !done);
  const hasIdempotency = operation.parameters.some((p) => p.name === 'Idempotency-Key');
  const mutation = useMutation({
    mutationFn: (body: Row) =>
      api(
        resolvePath(operation.path, {
          ...(record?.id ? { id: record.id } : {}),
          ...(operation.path === '/projects/{projectId}' && record?.id
            ? { projectId: record.id }
            : {}),
        }),
        {
          method: operation.method.toUpperCase(),
          body,
          idempotencyKey: hasIdempotency ? key : undefined,
        },
      ),
    onSuccess: (data, body) => {
      setDone(data ?? {});
      setCustomerLoginEnabled(customerCreate && Boolean(body.email));
      setDraft(undefined);
      setReview(null);
      toast.success(t('Saved successfully'));
      void queryClient.invalidateQueries();
      onSuccess?.(data);
    },
  });
  const uncertain = mutation.error instanceof ApiError && mutation.error.status === 0;
  const values =
    initial ??
    (operation.method === 'patch' && record
      ? Object.fromEntries(
          Object.keys(bodySchema.properties ?? {})
            .filter((k) => record[k] !== undefined)
            .map((k) => [k, record[k]]),
        )
      : undefined);
  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      beforeClose={async () =>
        !mutation.isPending && (!!done || confirmationOnly || (await confirmDiscard()))
      }
      title={done ? t('Request completed') : title}
      description={
        done
          ? undefined
          : confirmationOnly
            ? t('Review the details below, then confirm.')
            : t('Complete the fields below, then review before saving.')
      }
      wide={!customerCreate && !confirmationOnly}
      className={customerCreate ? 'customer-dialog' : undefined}
    >
      <div className="modal-body">
        {done ? (
          <div className="success-panel">
            <CheckCircle2 size={40} />
            <h3>{t(bookingConfirmation ? 'Booking confirmed' : 'Saved to your project')}</h3>
            <p>{t('Your changes have been saved.')}</p>
            {customerCreate && (
              <p>
                {customerLoginEnabled
                  ? t(
                      'Member portal access is active. Their login ID and generated password are queued for email delivery.',
                    )
                  : t(
                      'Member record saved. Send an invitation from Member portal access when you want to enable login.',
                    )}
              </p>
            )}
            {Boolean(row(done).status) && <Badge value={row(done).status} />}
            <div className="result-references">
              {Object.entries(row(done))
                .filter(([k, v]) => (k === 'name' || k === 'reference' || k === 'code') && v)
                .map(([k, v]) => (
                  <div key={k}>
                    <span>{humanize(k)}</span>
                    <code>
                      {typeof v === 'object'
                        ? String(row(v).reference ?? row(v).name ?? 'Created')
                        : String(v)}
                    </code>
                  </div>
                ))}
            </div>
            {operation.path.endsWith('/generate') && row(done).id ? (
              <JobStatus id={String(row(done).id)} />
            ) : null}
            {operation.path === '/projects' && row(done).id && (
              <Button asChild>
                <Link to={'/projects?record=' + row(done).id} onClick={onClose}>
                  Continue project setup
                </Link>
              </Button>
            )}
            <ModalClose asChild>
              <Button variant="secondary">{t('Done')}</Button>
            </ModalClose>
          </div>
        ) : review || confirmationOnly ? (
          <>
            <div className="review-notice">
              <AlertTriangle size={20} />
              <div>
                <strong>{t('Confirm this action')}</strong>
                <p>
                  {t(
                    bookingConfirmation
                      ? 'This confirms the booking. Payments can be recorded afterward.'
                      : 'Check the details below, then save your changes.',
                  )}
                </p>
              </div>
            </div>
            {Array.isArray(reviewValues.units) && (
              <DataTable
                data={asRows(reviewValues.units).slice(0, 10)}
                columns={['number', 'type', 'size', 'price', 'phase', 'block']}
                controls={false}
              />
            )}
            {Object.keys(reviewValues).length > 0 && (
              <>
                {reviewValues.bookingId &&
                /\/(transfers|possessions)(?:\/|$)/.test(operation.path) ? (
                  <OwnershipParties
                    bookingId={reviewValues.bookingId}
                    buyerId={reviewValues.buyerId}
                  />
                ) : null}
                <dl className="review-values">
                  {Object.entries(reviewValues)
                    .filter(([k]) => !/Ids?$/.test(k) && k !== 'updatedAt')
                    .map(([k, v]) =>
                      k === 'verification' ? (
                        <div className="verification-review" key={k}>
                          <VerificationSummary value={v} />
                        </div>
                      ) : (
                        <div key={k}>
                          <dt>
                            {k === 'charges' && operation.path.includes('/transfers')
                              ? t('Transfer fee')
                              : humanize(k)}
                          </dt>
                          <dd>
                            {/password|identity/i.test(k)
                              ? '••••••••'
                              : Array.isArray(v)
                                ? t('{0} entries', { '0': v.length })
                                : typeof v === 'object'
                                  ? t('Configured')
                                  : String(v)}
                          </dd>
                        </div>
                      ),
                    )}
                </dl>
              </>
            )}
            {mutation.error && <ErrorState error={mutation.error} />}
            <div className="form-footer">
              {confirmationOnly ? (
                <ModalClose asChild>
                  <Button variant="secondary" disabled={mutation.isPending}>
                    {t('Cancel')}
                  </Button>
                </ModalClose>
              ) : (
                <Button
                  variant="secondary"
                  disabled={mutation.isPending || uncertain}
                  onClick={() => setReview(null)}
                >
                  {t('Back to details')}
                </Button>
              )}
              <Button
                busy={mutation.isPending}
                variant={
                  /reverse|cancel|delete|withdraw|lock|revoke/.test(operation.path)
                    ? 'danger'
                    : 'primary'
                }
                disabled={uncertain && !hasIdempotency}
                onClick={() => mutation.mutate(confirmationOnly ? {} : review!)}
              >
                {uncertain
                  ? t('Retry the same request')
                  : t(confirmationOnly ? title : 'Confirm & submit')}
              </Button>
            </div>
            {uncertain && (
              <p className="muted">
                {hasIdempotency
                  ? t(
                      'The original request key is retained. Retrying cannot create a duplicate payment.',
                    )
                  : t(
                      'Close this dialog and check the latest records before starting another request.',
                    )}
              </p>
            )}
          </>
        ) : (
          <>
            {operation.path.endsWith('/units/import') && (
              <CsvImport schema={bodySchema} onReady={prepare} />
            )}
            <SchemaForm
              schema={bodySchema}
              initial={draft ?? values}
              onSubmit={prepare}
              entityId={record?.id}
              operationPath={operation.path}
              error={mutation.error}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
