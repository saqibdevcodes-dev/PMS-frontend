import { api } from './api';
import { saveFile } from '../platform/adapter';
import { toast } from 'sonner';
import { t } from './i18n';
import { errorMessage } from './error-messages';

export interface ExportReportOptions {
  projectId: string;
  report: Record<string, unknown>;
  format: 'xlsx' | 'pdf';
  filename?: string;
}

export async function exportAndDownloadReport({
  projectId,
  report,
  format,
  filename,
}: ExportReportOptions): Promise<void> {
  const toastId = toast.loading(
    format === 'pdf' ? t('Generating PDF document…') : t('Generating Excel spreadsheet…')
  );

  try {
    // 1. Queue or trigger export job
    const job = await api<{ id: string }>(`/projects/${projectId}/reports/exports`, {
      method: 'POST',
      body: { report, format },
    });

    if (!job?.id) {
      throw new Error(t('Export request could not be created.'));
    }

    const defaultFilename =
      filename ||
      `estate-${report.kind || 'report'}-${Date.now().toString().slice(-6)}.${format}`;

    // 2. Poll job status until COMPLETED (with up to 25 attempts, 500ms delay)
    let isComplete = false;
    for (let i = 0; i < 25; i++) {
      const statusRes = await api<{ status: string; error?: string }>(
        `/projects/${projectId}/jobs/${job.id}`
      );

      if (statusRes.status === 'COMPLETED') {
        isComplete = true;
        break;
      }
      if (statusRes.status === 'FAILED') {
        throw new Error(statusRes.error || t('Document generation failed on the server.'));
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 3. Fetch expiring pre-signed download URL (which also ensures on-demand generation)
    const downloadRes = await api<{ url: string }>(
      `/projects/${projectId}/jobs/${job.id}/download`
    );

    if (!downloadRes?.url) {
      throw new Error(t('Could not obtain secure download URL.'));
    }

    // 4. Download file directly to user device/browser
    await saveFile(downloadRes.url, defaultFilename);
    toast.dismiss(toastId);
    toast.success(
      format === 'pdf'
        ? t('PDF document downloaded successfully')
        : t('Excel spreadsheet downloaded successfully')
    );
  } catch (err) {
    toast.dismiss(toastId);
    toast.error(errorMessage(err));
    throw err;
  }
}
