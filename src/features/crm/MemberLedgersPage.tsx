import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Receipt,
  Printer,
  Download,
  FileSpreadsheet,
  X,
  UserCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { t, useLocale } from '../../lib/i18n';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { asRows, type Page } from '../../lib/types';
import { Button, Skeleton } from '../../components/ui';
import { CustomerStatement, type AccountStatement } from '../reports/CustomerStatement';
import { exportAndDownloadReport } from '../../lib/export-download';
import './customer-detail.css';

interface CustomerItem {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  paymentStatus?: string | null;
  identityLast4?: string | null;
}

export default function MemberLedgersPage() {
  useLocale();
  const [params, setParams] = useSearchParams();
  const projectId = usePreferences((s) => s.projectId);

  const activeCustomerId = params.get('customerId') ?? '';
  const fromDate = params.get('from') ?? '';
  const toDate = params.get('to') ?? '';

  // 1. Query all project members
  const membersQuery = useQuery({
    queryKey: ['project-members-list', projectId],
    enabled: !!projectId && can('customers.read'),
    queryFn: ({ signal }) =>
      api<Page>(`/projects/${projectId}/customers?limit=100`, { signal }),
  });

  const members = asRows(membersQuery.data?.items) as unknown as CustomerItem[];

  // Auto-select first member if none selected
  useEffect(() => {
    if (!activeCustomerId && members.length > 0 && members[0]?.id) {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('customerId', members[0]!.id);
        return next;
      }, { replace: true });
    }
  }, [members, activeCustomerId, setParams]);

  const selectedMember = members.find((m) => m.id === activeCustomerId);

  // 2. Query Statement Report for selected member
  const statementSuffix = new URLSearchParams({
    kind: 'customer-statement',
    ...(activeCustomerId ? { customerId: activeCustomerId } : {}),
    ...(fromDate ? { from: fromDate } : {}),
    ...(toDate ? { to: toDate } : {}),
  }).toString();

  const statementQuery = useQuery({
    queryKey: ['member-statement-report', projectId, activeCustomerId, statementSuffix],
    enabled: !!activeCustomerId && !!projectId && can('reports.read'),
    queryFn: ({ signal }) =>
      api<{ statement?: AccountStatement }>(`/projects/${projectId}/reports?${statementSuffix}`, {
        signal,
      }),
  });

  // 3. Export Mutations
  const exportMutation = useMutation({
    mutationFn: (format: 'xlsx' | 'pdf') =>
      exportAndDownloadReport({
        projectId: projectId!,
        report: {
          kind: 'customer-statement',
          customerId: activeCustomerId,
          ...(fromDate ? { from: fromDate } : {}),
          ...(toDate ? { to: toDate } : {}),
        },
        format,
        filename: `${selectedMember?.name ? selectedMember.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'member'}-statement.${format}`,
      }),
  });

  const handlePrint = () => {
    document.body.classList.add('print-customer-statement-active');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-customer-statement-active');
    }, 1000);
  };

  const handleMemberSelect = (id: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('customerId', id);
      return next;
    });
  };

  const statement = statementQuery.data?.statement;

  return (
    <div className="customer-detail-page">
      {/* Page Header */}
      <div className="customer-detail-header" style={{ marginBottom: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginBottom: 4 }}>
            <Receipt size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t('Financial Records')}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
            {t('Member Statement & Account Ledgers')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
            {t('All member bookings, payment schedules, and verified records')}
          </p>
        </div>

        {selectedMember && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={handlePrint} disabled={!statement}>
              <Printer size={15} />
              {t('Print statement')}
            </Button>

            {can('reports.export') && (
              <>
                <Button
                  variant="secondary"
                  busy={exportMutation.isPending}
                  disabled={!statement}
                  onClick={() => exportMutation.mutate('pdf')}
                >
                  <Download size={15} />
                  {t('Export PDF')}
                </Button>
                <Button
                  variant="secondary"
                  busy={exportMutation.isPending}
                  disabled={!statement}
                  onClick={() => exportMutation.mutate('xlsx')}
                >
                  <FileSpreadsheet size={15} />
                  {t('Export Excel')}
                </Button>
              </>
            )}

            <Button asChild variant="primary">
              <Link to={`/customers/${selectedMember.id}`}>
                <UserCheck size={15} />
                {t('View member profile')}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Selection Card */}
      <div
        className="customer-section-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Member Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
              {t('Select member')}:
            </label>
            <select
              value={activeCustomerId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 14,
                background: 'var(--panel)',
                color: 'var(--text)',
              }}
            >
              {members.length === 0 && <option value="">{t('No members found')}</option>}
              {members.map((m) => {
                const code = m.id.toUpperCase().startsWith('MEM-')
                  ? m.id
                  : `MEM-${m.id.slice(0, 8).toUpperCase()}`;
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} · {code} {m.phone ? `(${m.phone})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Range Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <label style={{ fontWeight: 600, color: 'var(--muted)' }}>{t('From date')}</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (val) next.set('from', val);
                    else next.delete('from');
                    return next;
                  });
                }}
                style={{
                  padding: '7px 10px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <label style={{ fontWeight: 600, color: 'var(--muted)' }}>{t('To date')}</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (val) next.set('to', val);
                    else next.delete('to');
                    return next;
                  });
                }}
                style={{
                  padding: '7px 10px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
            </div>

            {(fromDate || toDate) && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  setParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete('from');
                    next.delete('to');
                    return next;
                  });
                }}
              >
                <X size={14} />
                {t('Clear filters')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statement Sheet Container */}
      <div className="customer-tab-panel">
        <div className="customer-section-card" style={{ padding: 24 }}>
          {statementQuery.isLoading ? (
            <Skeleton rows={8} />
          ) : statement ? (
            <CustomerStatement statement={statement} />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
              <Receipt size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <h4 style={{ margin: '0 0 6px', color: 'var(--text)', fontSize: 16 }}>
                {t('No statement available for this member.')}
              </h4>
              <p style={{ margin: 0, fontSize: 13 }}>
                {t('Select another member or verify that the member has confirmed property bookings.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
