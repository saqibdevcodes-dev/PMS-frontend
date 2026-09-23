import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { resources } from '../resources/catalog';
import { money } from '../../lib/format';
import { PageHeading, ErrorState } from '../../components/ui';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
export default function Finance() {
  const projectId = usePreferences((s) => s.projectId);
  const balance = useQuery({
    queryKey: ['finance-overview', projectId],
    enabled: !!projectId && can('finance.read') && can('reports.read'),
    queryFn: ({ signal }) =>
      api<{ summary: { debit: string; credit: string; balanced: boolean }; currency: string }>(
        `/projects/${projectId}/reports?kind=trial-balance`,
        { signal },
      ),
  });
  if (!can('finance.read')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  return (
    <>
      <PageHeading
        eyebrow="Finance & accounting"
        title="Financial workspace"
        description="A reliable ledger. A clear view of every movement."
      />
      {balance.isError ? (
        <ErrorState error={balance.error} />
      ) : (
        balance.data && (
          <div className="finance-balance">
            <div>
              <ShieldCheck size={24} />
              <span>
                <strong>
                  {balance.data.summary.balanced
                    ? 'Your trial balance reconciles'
                    : 'Your trial balance needs review'}
                </strong>
                <small>All posted journal lines, including reversals</small>
              </span>
            </div>
            <div>
              <span>Total debits</span>
              <strong>{money(balance.data.summary.debit, balance.data.currency)}</strong>
            </div>
            <div>
              <span>Total credits</span>
              <strong>{money(balance.data.summary.credit, balance.data.currency)}</strong>
            </div>
          </div>
        )
      )}
      <div className="finance-modules">
        {resources
          .filter((r) =>
            ['accounts', 'journals', 'bank-accounts', 'vendors', 'accounting-periods'].includes(
              r.slug,
            ),
          )
          .map((r) => (
            <Link to={'/' + r.slug} key={r.slug} className="panel">
              <span className="finance-icon">
                <r.icon size={23} />
              </span>
              <h2>{r.label}</h2>
              <p>{r.description}</p>
              <span className="text-link">
                Open workspace
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
      </div>
      {can('reports.read') && (
        <section className="panel financial-reports">
          <div className="panel-heading">
            <div>
              <h2>Financial statements</h2>
              <p>Source records, reconciled by the backend</p>
            </div>
          </div>
          <div>
            {[
              'trial-balance',
              'income-statement',
              'balance-sheet',
              'cash-book',
              'bank-book',
              'vendor-ledger',
              'ledger',
            ].map((kind) => (
              <Link to={'/reports?kind=' + kind} key={kind}>
                {kind.replaceAll('-', ' ')}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
