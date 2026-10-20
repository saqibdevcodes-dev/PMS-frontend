import { errorMessage } from '../../lib/error-messages';
import { t, useLocale } from '../../lib/i18n';
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
import { DocumentUploadModal } from '../../components/DocumentUploadModal';
import { Select } from '../../components/Select';
import { confirmDiscard, useUnsavedChanges } from '../../hooks/use-unsaved';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
export default function Documents() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File>();
  const [documentName, setDocumentName] = useState('');
  const [customerId, setCustomerId] = useState(params.get('customerId') ?? '');
  const [bookingId, setBookingId] = useState(params.get('bookingId') ?? '');
  const [audience, setAudience] = useState('STAFF_ONLY');
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
      if (!file) throw new Error(t('Select a file.'));
      const body = new FormData();
      if (!documentName.trim()) throw new Error(t('Enter a document name.'));
      body.append('file', file);
      body.append('name', documentName.trim());
      body.append('audience', audience);
      if (audience !== 'ALL_PROJECT_CUSTOMERS') {
        if (customerId) body.append('customerId', customerId);
        if (bookingId) body.append('bookingId', bookingId);
      }
      return api(`/projects/${projectId}/documents`, { method: 'POST', body });
    },
    onSuccess: () => {
      toast.success(t('Document uploaded'));
      setUploading(false);
      setFile(undefined);
      setDocumentName('');
      setAudience('STAFF_ONLY');
      void queryClient.invalidateQueries();
    },
    onError: setError,
  });
  const download = useMutation({
    mutationFn: (r: Row) =>
      api<{ url: string }>(`/projects/${projectId}/documents/${r.id}/download`),
    onSuccess: (r) =>
      void saveFile(r.url, String(download.variables?.name ?? 'document.pdf')).catch((e: Error) =>
        toast.error(errorMessage(e)),
      ),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const visibility = useMutation({
    mutationFn: (r: Row) =>
      api(`/projects/${projectId}/documents/${r.id}/portal-visibility`, {
        method: 'PATCH',
        body: {
          portalVisible: !r.portalVisible,
          allProjectCustomers: !r.customerId && !r.bookingId,
        },
      }),
    onSuccess: () => {
      toast.success(t('Customer sharing updated'));
      void query.refetch();
    },
    onError: (e: Error) => toast.error(errorMessage(e)),
  });
  useUnsavedChanges(uploading && Boolean(file || documentName.trim()));
  if (!can('documents.read')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  function choose(selected?: File) {
    setError(undefined);
    if (!selected) return;
    if (
      !['application/pdf', 'image/jpeg', 'image/png'].includes(selected.type) ||
      selected.size > 10 * 1024 * 1024
    ) {
      setError(new Error(t('Choose a PDF, JPEG, or PNG up to 10 MiB.')));
      return;
    }
    setFile(selected);
    if (!documentName) setDocumentName(selected.name.replace(/\.[^.]+$/, ''));
  }
  return (
    <>
      <PageHeading
        eyebrow={t('Project records')}
        title={t('Document library')}
        description={t('Important paperwork, securely connected to the right records.')}
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to="/document-templates">
                <FileText size={16} />
                {t('Templates')}
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
                {t('Upload document')}
              </Button>
            )}
          </>
        }
      />
      <div className="document-notice">
        <span className="live-dot" />
        {t('Private files · Permission-checked downloads · Links expire in 120 seconds')}
      </div>
      {query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton rows={5} />
      ) : !asRows(query.data).length ? (
        <div className="panel">
          <EmptyState
            title={t('Keep your records close')}
            description={t(
              'Upload a booking form, identity document, or property record to start your library.',
            )}
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
                <span>{r.mime === 'application/pdf' ? t('PDF') : t('IMAGE')}</span>
              </div>
              <div className="document-info">
                <h3 title={String(r.name)}>{String(r.name)}</h3>
                <small>
                  {t(
                    r.portalVisible
                      ? r.allProjectCustomers
                        ? 'Shared with all project customers'
                        : 'Shared with selected customer'
                      : 'Staff only',
                  )}
                </small>
                {can('documents.manage') && (!r.customerId || can('customers.view_sensitive')) && (
                  <Button
                    variant="ghost"
                    size="small"
                    busy={visibility.isPending && visibility.variables?.id === r.id}
                    onClick={() => visibility.mutate(r)}
                  >
                    {r.portalVisible
                      ? t('Withdraw from customer portal')
                      : t(
                          !r.customerId && !r.bookingId
                            ? 'Share with all project customers'
                            : 'Share with customer portal',
                        )}
                  </Button>
                )}
                <p>
                  {(Number(r.size) / 1024).toFixed(0)} {t('KB')} <span>·</span> {date(r.createdAt)}
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  busy={download.isPending && download.variables?.id === r.id}
                  onClick={() => download.mutate(r)}
                >
                  <Download size={14} />
                  {t('Secure download')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {query.data && query.data.pagination.totalPages > 1 && (
        <div className="grid-pagination">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            {t('Previous')}
          </Button>
          <span>
            {t('Page')} {page} {t('of')} {query.data.pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page === query.data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t('Next')}
          </Button>
        </div>
      )}
      <DocumentUploadModal
        open={uploading}
        onOpenChange={setUploading}
        context="documents"
        customerId={customerId}
        bookingId={bookingId}
        onSuccess={() => void query.refetch()}
      />
    </>
  );
}
