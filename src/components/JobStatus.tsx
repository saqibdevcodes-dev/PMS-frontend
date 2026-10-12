import { errorMessage } from '../lib/error-messages';
import { t, useLocale } from '../lib/i18n';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Row } from '../lib/types';
import { usePreferences } from '../stores/preferences';
import { saveFile } from '../platform/adapter';
import { Button, ErrorState, Badge } from './ui';
export function JobStatus({
  id,
  filename = 'estate-document.pdf',
}: {
  id: string;
  filename?: string;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const query = useQuery({
    queryKey: ['job', projectId, id],
    queryFn: ({ signal }) => api<Row>(`/projects/${projectId}/jobs/${id}`, { signal }),
    refetchInterval: (q) =>
      ['COMPLETED', 'FAILED'].includes(String(q.state.data?.status)) ? false : 2000,
  });
  const download = useMutation({
    mutationFn: () => api<{ url: string }>(`/projects/${projectId}/jobs/${id}/download`),
    onSuccess: (r) =>
      void saveFile(r.url, filename).catch((e: Error) => toast.error(errorMessage(e))),
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="job-status" role="status">
      <FileText size={19} />
      <span>
        <strong>{t('Document generation')}</strong>
        <small>
          {query.data?.status === 'FAILED'
            ? String(query.data.error ?? 'Generation failed.')
            : query.data?.status === 'COMPLETED'
              ? t('Your private document is ready.')
              : t('The server is preparing your document.')}
        </small>
      </span>
      {query.isError ? (
        <ErrorState error={query.error} />
      ) : (
        <Badge value={query.data?.status ?? 'PENDING'} />
      )}
      <Button
        size="small"
        variant="secondary"
        disabled={query.data?.status !== 'COMPLETED'}
        busy={download.isPending}
        onClick={() => download.mutate()}
      >
        <Download size={15} />
        {t('Download')}
      </Button>
    </div>
  );
}
