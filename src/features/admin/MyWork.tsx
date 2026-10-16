import { t, useLocale } from '../../lib/i18n';
import { useQueries } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth, can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { api } from '../../lib/api';
import { asRows } from '../../lib/types';
import { PageHeading, ErrorState, EmptyState } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { ProjectRequired } from '../resources/ResourcePage';
export default function MyWork() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const user = useAuth((s) => s.user)!;
  const navigate = useNavigate();
  const groups = [
    {
      name: 'Recovery cases',
      path: 'recovery-cases',
      slug: 'recovery',
      permission: 'recovery.manage',
      columns: ['booking', 'status', 'createdAt'],
      params: '&assignedTo=' + user.id,
    },
    {
      name: 'Payments to verify',
      path: 'payments',
      slug: 'collections',
      permission: 'payments.verify',
      columns: ['booking', 'amount', 'method', 'status'],
      params: '&status=PENDING',
    },
  ].filter((g) => can(g.permission));
  const queries = useQueries({
    queries: groups.map((g) => ({
      queryKey: ['my-work', projectId, g.path, user.id],
      enabled: !!projectId,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        api(`/projects/${projectId}/${g.path}?limit=25${g.params}`, { signal }),
    })),
  });
  if (!projectId) return <ProjectRequired />;
  return (
    <>
      <PageHeading
        eyebrow={t('Your daily focus')}
        title={t('My work')}
        description={t('Assigned records and decisions that need your attention.')}
      />
      <div className="my-work-grid">
        {groups.map((group, i) => {
          const records = asRows(queries[i]?.data);
          return (
            <section className="panel" key={group.path}>
              <div className="panel-heading">
                <div>
                  <h2>{group.name}</h2>
                  <p>{t('Most recent records in this project')}</p>
                </div>
                <Link className="text-link" to={'/' + group.slug}>
                  {t('Open module')}
                  <ArrowRight size={14} />
                </Link>
              </div>
              {queries[i]?.isError ? (
                <ErrorState error={queries[i]?.error} />
              ) : (
                <DataTable
                  data={records}
                  columns={group.columns}
                  controls={false}
                  busy={queries[i]?.isLoading}
                  onRow={(r) => navigate('/' + group.slug + '?record=' + r.id)}
                  empty={
                    <EmptyState
                      compact
                      title={t('Nothing waiting here')}
                      description={t('New assignments and requests will appear as they arrive.')}
                    />
                  }
                />
              )}
            </section>
          );
        })}
      </div>
      {!groups.length && (
        <div className="panel">
          <EmptyState
            title={t('Your workspace is ready')}
            description={t('An administrator can assign the project permissions you need.')}
          />
        </div>
      )}
    </>
  );
}
