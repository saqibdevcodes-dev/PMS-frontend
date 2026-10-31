import { Money } from '../../components/Money';
import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Download,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { api, queryString } from '../../lib/api';
import { humanize } from '../../lib/format';
import { asRows, type Row } from '../../lib/types';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { Button, PageHeading, ErrorState, EmptyState } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { RelationSelect } from '../../components/RelationSelect';
import { Select } from '../../components/Select';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import { JobStatus } from '../../components/JobStatus';
import { CustomerStatement, type AccountStatement } from './CustomerStatement';
import { exportAndDownloadReport } from '../../lib/export-download';
import { print } from '../../platform/adapter';
export const reportGroups: Record<string, string[]> = {
  'Sales & inventory': [
    'sales',
    'inventory',
    'collections',
    'installments',
    'dealer-sales',
    'deal-profitability',
  ],
  'Customers & recovery': ['outstanding', 'ageing', 'defaulters', 'customer-statement'],
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
  const [jobs, _setJobs] = useState<{ id: string; projectId: string; filename: string }[]>([]);
  const filters = { ...Object.fromEntries(params), kind: params.get('kind') || 'sales' };
  const kind = filters.kind;
  const needsCustomer = kind === 'customer-statement' && !params.get('customerId');
  const financial = reportGroups['Financial statements']!.includes(kind);
  const query = useQuery({
    queryKey: ['report', projectId, filters],
    enabled:
      !!projectId && !needsCustomer && can('reports.read') && (!financial || can('finance.read')),
    queryFn: ({ signal }) =>
      api<{
        rows: Row[];
        summary: Record<string, string | boolean>;
        currency: string;
        statement?: AccountStatement;
      }>(`/projects/${projectId}/reports` + queryString(filters), { signal }),
  });
  const exportJob = useMutation({
    mutationFn: (format: 'xlsx' | 'pdf') =>
      exportAndDownloadReport({
        projectId: projectId!,
        report: filters,
        format,
        filename: `estate-${kind}.${format}`,
      }),
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
        title={
          kind === 'customer-statement' ? t('Customer account statement') : t('Reporting center')
        }
        description={
          kind === 'customer-statement'
            ? t('A clear view of property bookings, verified payments and remaining balances.')
            : t('Turn your project records into a clear, shared understanding.')
        }
        actions={
          can('reports.export') ? (
            <>
              {query.data?.statement && (
                <Button variant="secondary" onClick={() => void print()}>
                  <Printer size={16} />
                  {t('Print')}
                </Button>
              )}
              <Button
                variant="secondary"
                busy={exportJob.isPending}
                disabled={needsCustomer || query.isError || query.isLoading}
                onClick={() => exportJob.mutate('pdf')}
              >
                <FileText size={16} />
                {t('Export PDF')}
              </Button>
              <Button
                disabled={needsCustomer || query.isError || query.isLoading}
                busy={exportJob.isPending}
                onClick={() => exportJob.mutate('xlsx')}
              >
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
            <Select
              id="report-kind"
              value={draft.kind ?? kind}
              onChange={(value) => setDraft({ kind: value })}
              options={Object.entries(reportGroups)
                .filter(([group]) => group !== 'Financial statements' || can('finance.read'))
                .flatMap(([group, kinds]) =>
                  kinds.map((value) => ({ value, label: humanize(value), group: t(group) })),
                )}
            />
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
                  <Money value={value} currency={query.data.currency} />
                )}
              </strong>
            </div>
          ))}
        </div>
      )}
      {needsCustomer ? (
        <div className="panel">
          <EmptyState
            title={t('Choose a customer')}
            description={t(
              'Select a customer above and apply filters to view their account statement.',
            )}
          />
        </div>
      ) : query.data?.statement && !query.isError ? (
        <CustomerStatement statement={query.data.statement} />
      ) : (
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
      )}
      {jobs
        .filter((j) => j.projectId === projectId)
        .map((job) => (
          <JobStatus id={job.id} filename={job.filename} key={job.id} />
        ))}
    </>
  );
}
