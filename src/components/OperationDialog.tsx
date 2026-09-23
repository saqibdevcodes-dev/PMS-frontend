import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../lib/api';
import { resolvePath } from '../lib/contract';
import { queryClient } from '../lib/query';
import { humanize } from '../lib/format';
import { row, type Operation, type Row } from '../lib/types';
import { Button, Modal, ErrorState, Badge } from './ui';
import { SchemaForm } from './SchemaForm';
import { JobStatus } from './JobStatus';
import { useUnsavedChanges, confirmDiscard } from '../hooks/use-unsaved';
import { CsvImport } from './CsvImport';
import { DataTable } from './DataTable';
import { asRows } from '../lib/types';
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
  const [review, setReview] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>();
  function prepare(values: Row) {
    setDraft(values);
    setReview(values);
  }
  const [key] = useState(() => crypto.randomUUID());
  const [done, setDone] = useState<unknown>();
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
    onSuccess: (data) => {
      setDone(data ?? {});
      toast.success('Saved successfully');
      void queryClient.invalidateQueries();
      onSuccess?.(data);
    },
  });
  const uncertain = mutation.error instanceof ApiError && mutation.error.status === 0;
  const bodySchema = operation.body ?? { type: 'object', properties: {} };
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
      onOpenChange={(open) => {
        if (!open && !mutation.isPending && (done || confirmDiscard())) onClose();
      }}
      title={done ? 'Request completed' : title}
      description={operation.summary}
      wide
    >
      <div className="modal-body">
        {done ? (
          <div className="success-panel">
            <CheckCircle2 size={40} />
            <h3>Saved to your project</h3>
            <p>Your records now reflect the server-confirmed result.</p>
            {Boolean(row(done).status) && <Badge value={row(done).status} />}
            <div className="result-references">
              {Object.entries(row(done))
                .filter(
                  ([k, v]) =>
                    (k === 'id' || k === 'reference' || k === 'approval' || k === 'booking') && v,
                )
                .map(([k, v]) => (
                  <div key={k}>
                    <span>{humanize(k)}</span>
                    <code>
                      {typeof v === 'object'
                        ? String(row(v).reference ?? row(v).id ?? 'Created')
                        : String(v)}
                    </code>
                  </div>
                ))}
            </div>
            {operation.path.endsWith('/generate') && row(done).id ? (
              <JobStatus id={String(row(done).id)} />
            ) : null}
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : review ? (
          <>
            <div className="review-notice">
              <AlertTriangle size={20} />
              <div>
                <strong>Confirm this action</strong>
                <p>
                  Review the details before continuing. Permissions, approvals, and current state
                  will be checked by the server.
                </p>
              </div>
            </div>
            {Array.isArray(review.units) && (
              <DataTable
                data={asRows(review.units).slice(0, 10)}
                columns={['number', 'type', 'size', 'price', 'phase', 'block']}
                controls={false}
              />
            )}
            <dl className="review-values">
              {Object.entries(review).map(([k, v]) => (
                <div key={k}>
                  <dt>{humanize(k)}</dt>
                  <dd>
                    {/password|identity/i.test(k)
                      ? '••••••••'
                      : Array.isArray(v)
                        ? `${v.length} entries`
                        : typeof v === 'object'
                          ? 'Configured'
                          : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
            {mutation.error && <ErrorState error={mutation.error} />}
            <div className="form-footer">
              <Button
                variant="secondary"
                disabled={mutation.isPending || uncertain}
                onClick={() => setReview(null)}
              >
                Back to details
              </Button>
              <Button
                busy={mutation.isPending}
                variant={
                  /reverse|cancel|delete|withdraw|lock|revoke/.test(operation.path)
                    ? 'danger'
                    : 'primary'
                }
                disabled={uncertain && !hasIdempotency}
                onClick={() => mutation.mutate(review)}
              >
                {uncertain ? 'Retry the same request' : 'Confirm & submit'}
              </Button>
            </div>
            {uncertain && (
              <p className="muted">
                {hasIdempotency
                  ? 'The original request key is retained. Retrying cannot create a duplicate payment.'
                  : 'Close this dialog and check the latest records before starting another request.'}
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
            />
          </>
        )}
      </div>
    </Modal>
  );
}
