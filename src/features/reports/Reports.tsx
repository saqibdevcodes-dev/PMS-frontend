import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, FileText, SlidersHorizontal, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, queryString } from '../../lib/api';
import { humanize, money } from '../../lib/format';
import { asRows, type Row } from '../../lib/types';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { Button, PageHeading, ErrorState } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { RelationSelect } from '../../components/RelationSelect';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import { JobStatus } from '../../components/JobStatus';
export const reportGroups: Record<string, string[]> = {
  'Sales & inventory': ['sales', 'inventory', 'collections', 'installments'],
  'Customers & recovery': ['outstanding', 'ageing', 'customer-statement', 'dealers'],
  Ownership: ['ndcs', 'transfers', 'cancellations', 'refunds', 'possession'],
  'Financial statements': [
    'ledger',
    'cash-book',
    'bank-book',
    'vendor-ledger',
    'trial-balance',
    'income-statement',
    'balance-sheet',
  ],
};
export default function Reports() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(params));
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<{ id: string; projectId: string; filename: string }[]>([]);
  const filters = { ...Object.fromEntries(params), kind: params.get('kind') || 'sales' };
  const kind = filters.kind;
  const financial = reportGroups['Financial statements']!.includes(kind);
  const query = useQuery({
    queryKey: ['report', projectId, filters],
    enabled: !!projectId && can('reports.read') && (!financial || can('finance.read')),
    queryFn: ({ signal }) =>
      api<{ rows: Row[]; summary: Record<string, string | boolean>; currency: string }>(
        `/projects/${projectId}/reports` + queryString(filters),
        { signal },
      ),
  });
  const exportJob = useMutation({
    mutationFn: (format: 'xlsx' | 'pdf') =>
      api<Row>(`/projects/${projectId}/reports/exports`, {
        method: 'POST',
        body: { report: filters, format },
      }),
    onSuccess: (r, format) => {
      setJobs((v) => [{ id: String(r.id), projectId, filename: `estate-${kind}.${format}` }, ...v]);
      toast.success(t('Report generation started'));
    },
    onError: (e) => toast.error(e.message),
  });
  if (!can('reports.read') || (financial && !can('finance.read'))) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  const rows = asRows(query.data?.rows);
  const keys = rows[0]
    ? Object.keys(rows[0]).filter(
        (k) => !['projectId', 'createdBy', 'receivedBy', 'requestedBy'].includes(k),
      )
    : [];
  return (
    <>
      <PageHeading
        eyebrow={t('Insights & analysis')}
        title={t('Reporting center')}
        description={t('Turn your project records into a clear, shared understanding.')}
        actions={
          can('reports.export') ? (
            <>
              <Button
                variant="secondary"
                busy={exportJob.isPending}
                onClick={() => exportJob.mutate('pdf')}
              >
                <FileText size={16} />
                {t('Export PDF')}
              </Button>
              <Button busy={exportJob.isPending} onClick={() => exportJob.mutate('xlsx')}>
                <Download size={16} />
                {t('Export Excel')}
              </Button>
            </>
          ) : undefined
        }
      />
      <form
        className="panel report-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setParams(Object.fromEntries(Object.entries(draft).filter(([, v]) => v)));
        }}
      >
        <div className="report-filter-title">
          <SlidersHorizontal size={18} />
          <strong>{t('Build your report')}</strong>
        </div>
        <div className="report-filter-grid">
          <div className="form-field">
            <label htmlFor="report-kind">{t('Report')}</label>
            <select
              id="report-kind"
              value={draft.kind ?? kind}
              onChange={(e) => setDraft({ kind: e.target.value })}
            >
              {Object.entries(reportGroups)
                .filter(([group]) => group !== 'Financial statements' || can('finance.read'))
                .map(([group, kinds]) => (
                  <optgroup key={group} label={t(group)}>
                    {kinds.map((k) => (
                      <option key={k} value={k}>
                        {humanize(k)}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="report-from">{t('From date')}</label>
            <input
              id="report-from"
              type="date"
              value={draft.from ?? ''}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="report-to">{t('Through date')}</label>
            <input
              id="report-to"
              type="date"
              value={draft.to ?? ''}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="report-phase">{t('Phase')}</label>
            <input
              id="report-phase"
              placeholder={t('All phases')}
              value={draft.phase ?? ''}
              onChange={(e) => setDraft({ ...draft, phase: e.target.value })}
            />
          </div>
          {['customer-statement', 'vendor-ledger', 'ledger'].includes(draft.kind ?? kind) && (
            <div className="form-field">
              <label htmlFor="report-relation">
                {(draft.kind ?? kind) === 'customer-statement'
                  ? t('Customer')
                  : (draft.kind ?? kind) === 'vendor-ledger'
                    ? t('Vendor')
                    : t('Account')}
              </label>
              {(() => {
                const name =
                  (draft.kind ?? kind) === 'customer-statement'
                    ? 'customerId'
                    : (draft.kind ?? kind) === 'vendor-ledger'
                      ? 'vendorId'
                      : 'accountId';
                return (
                  <RelationSelect
                    id="report-relation"
                    name={name}
                    value={draft[name] ?? ''}
                    onChange={(v) => setDraft({ ...draft, [name]: v })}
                  />
                );
              })()}
            </div>
          )}
          <Button type="submit">
            <RefreshCw size={15} />
            {t('Apply filters')}
          </Button>
        </div>
      </form>
      {query.data?.summary && Object.keys(query.data.summary).length > 0 && (
        <div className="report-totals">
          {Object.entries(query.data.summary).map(([key, value]) => (
            <div key={key}>
              <span>{humanize(key)}</span>
              <strong>
                {typeof value === 'boolean' ? (
                  <>
                    <CheckCircle2 size={18} />
                    {value ? t('Balanced') : t('Out of balance')}
                  </>
                ) : (
                  money(value, query.data.currency)
                )}
              </strong>
            </div>
          ))}
        </div>
      )}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>{humanize(kind)}</h2>
            <p>
              {query.data?.currency ?? t('Project currency')} {t('· Server-calculated report')}
            </p>
          </div>
        </div>
        {query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : (
          <DataTable
            data={rows.slice((page - 1) * 25, page * 25)}
            columns={keys}
            busy={query.isLoading}
            page={page}
            total={rows.length}
            onPage={setPage}
            currency={query.data?.currency}
          />
        )}
      </div>
      {jobs
        .filter((j) => j.projectId === projectId)
        .map((job) => (
          <JobStatus id={job.id} filename={job.filename} key={job.id} />
        ))}
    </>
  );
}
