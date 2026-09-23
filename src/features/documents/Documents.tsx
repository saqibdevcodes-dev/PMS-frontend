import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UploadCloud, Download, FileText, Image, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { asRows, type Page, type Row } from '../../lib/types';
import { date } from '../../lib/format';
import { saveFile, captureDocument, platform } from '../../platform/adapter';
import { Button, PageHeading, Modal, ErrorState, EmptyState, Skeleton } from '../../components/ui';
import { RelationSelect } from '../../components/RelationSelect';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
export default function Documents() {
  const projectId = usePreferences((s) => s.projectId);
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File>();
  const [customerId, setCustomerId] = useState(params.get('customerId') ?? '');
  const [bookingId, setBookingId] = useState(params.get('bookingId') ?? '');
  const [error, setError] = useState<unknown>();
  const suffix = new URLSearchParams({
    page: String(page),
    limit: '24',
    ...(params.get('customerId') ? { customerId: params.get('customerId')! } : {}),
    ...(params.get('bookingId') ? { bookingId: params.get('bookingId')! } : {}),
  });
  const query = useQuery({
    queryKey: ['documents', projectId, suffix.toString()],
    enabled: !!projectId && can('documents.read'),
    queryFn: ({ signal }) => api<Page>(`/projects/${projectId}/documents?${suffix}`, { signal }),
  });
  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Select a file.');
      const body = new FormData();
      body.append('file', file);
      if (customerId) body.append('customerId', customerId);
      if (bookingId) body.append('bookingId', bookingId);
      return api(`/projects/${projectId}/documents`, { method: 'POST', body });
    },
    onSuccess: () => {
      toast.success('Document uploaded');
      setUploading(false);
      setFile(undefined);
      void queryClient.invalidateQueries();
    },
    onError: setError,
  });
  const download = useMutation({
    mutationFn: (r: Row) =>
      api<{ url: string }>(`/projects/${projectId}/documents/${r.id}/download`),
    onSuccess: (r) =>
      void saveFile(r.url, String(download.variables?.name ?? 'document.pdf')).catch((e: Error) =>
        toast.error(e.message),
      ),
    onError: (e) => toast.error(e.message),
  });
  if (!can('documents.read')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  function choose(selected?: File) {
    setError(undefined);
    if (!selected) return;
    if (
      !['application/pdf', 'image/jpeg', 'image/png'].includes(selected.type) ||
      selected.size > 10 * 1024 * 1024
    ) {
      setError(new Error('Choose a PDF, JPEG, or PNG up to 10 MiB.'));
      return;
    }
    setFile(selected);
  }
  return (
    <>
      <PageHeading
        eyebrow="Project records"
        title="Document library"
        description="Important paperwork, securely connected to the right records."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to="/document-templates">
                <FileText size={16} />
                Templates
              </Link>
            </Button>
            {can('documents.manage') && (
              <Button
                onClick={() => {
                  setUploading(true);
                  setError(undefined);
                }}
              >
                <Upload size={16} />
                Upload document
              </Button>
            )}
          </>
        }
      />
      <div className="document-notice">
        <span className="live-dot" />
        Private files · Permission-checked downloads · Links expire in 120 seconds
      </div>
      {query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton rows={5} />
      ) : !asRows(query.data).length ? (
        <div className="panel">
          <EmptyState
            title="Keep your records close"
            description="Upload a booking form, identity document, or property record to start your library."
          />
        </div>
      ) : (
        <div className="document-grid">
          {asRows(query.data).map((r) => (
            <div className="document-card" key={r.id}>
              <div
                className={'document-preview ' + (r.mime === 'application/pdf' ? 'pdf' : 'image')}
              >
                {r.mime === 'application/pdf' ? <FileText size={42} /> : <Image size={42} />}
                <span>{r.mime === 'application/pdf' ? 'PDF' : 'IMAGE'}</span>
              </div>
              <div className="document-info">
                <h3 title={String(r.name)}>{String(r.name)}</h3>
                <p>
                  {(Number(r.size) / 1024).toFixed(0)} KB <span>·</span> {date(r.createdAt)}
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  busy={download.isPending && download.variables?.id === r.id}
                  onClick={() => download.mutate(r)}
                >
                  <Download size={14} />
                  Secure download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {query.data && query.data.pagination.totalPages > 1 && (
        <div className="grid-pagination">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {query.data.pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page === query.data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <Modal
        open={uploading}
        onOpenChange={(v) => !upload.isPending && setUploading(v)}
        title="Add a document"
        description="PDF, JPEG, or PNG files up to 10 MiB."
      >
        <div className="modal-body">
          <label
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              choose(e.dataTransfer.files[0]);
            }}
          >
            <UploadCloud size={32} />
            <strong>{file ? file.name : 'Drop a document here'}</strong>
            <span>{file ? 'Click to choose another file' : 'or click to browse your files'}</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              aria-label="Choose document"
              onChange={(e) => choose(e.target.files?.[0])}
            />
          </label>
          {platform.mobile && (
            <Button
              variant="secondary"
              onClick={() => {
                void captureDocument().then(choose).catch(setError);
              }}
            >
              <Camera size={16} />
              Capture document
            </Button>
          )}
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="upload-customer">Customer (optional)</label>
              <RelationSelect
                id="upload-customer"
                name="customerId"
                value={customerId}
                onChange={setCustomerId}
              />
            </div>
            <div className="form-field">
              <label htmlFor="upload-booking">Booking (optional)</label>
              <RelationSelect
                id="upload-booking"
                name="bookingId"
                value={bookingId}
                onChange={setBookingId}
              />
            </div>
          </div>
          {Boolean(error) && <ErrorState error={error} />}
          <div className="form-footer">
            <span>
              {upload.isPending
                ? 'Uploading and validating your document…'
                : 'Linked customer files require sensitive-data permission.'}
            </span>
            <Button disabled={!file} busy={upload.isPending} onClick={() => upload.mutate()}>
              Upload document
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
