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
  const projectId = usePreferences((s) => s.projectId);
  const user = useAuth((s) => s.user)!;
  const navigate = useNavigate();
  const groups = [
    {
      name: 'Assigned leads',
      path: 'leads',
      slug: 'crm',
      permission: 'crm.read',
      columns: ['name', 'phone', 'status'],
      params: '&assignedTo=' + user.id,
    },
    {
      name: 'Recovery cases',
      path: 'recovery-cases',
      slug: 'recovery',
      permission: 'recovery.manage',
      columns: ['bookingId', 'status', 'createdAt'],
      params: '&assignedTo=' + user.id,
    },
    {
      name: 'Payments to verify',
      path: 'payments',
      slug: 'collections',
      permission: 'payments.verify',
      columns: ['bookingId', 'amount', 'method', 'status'],
      params: '&status=PENDING',
    },
    {
      name: 'Approval inbox',
      path: 'approvals',
      slug: 'approvals',
      permission: 'approvals.read',
      columns: ['operation', 'amount', 'status'],
      params: '',
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
        eyebrow="Your daily focus"
        title="My work"
        description="Assigned records and decisions that need your attention."
      />
      <div className="my-work-grid">
        {groups.map((group, i) => {
          let records = asRows(queries[i]?.data);
          if (group.path === 'approvals')
            records = records.filter((r) => r.status === 'PENDING' && r.requestedBy !== user.id);
          return (
            <section className="panel" key={group.path}>
              <div className="panel-heading">
                <div>
                  <h2>{group.name}</h2>
                  <p>Most recent records in this project</p>
                </div>
                <Link className="text-link" to={'/' + group.slug}>
                  Open module
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
                      title="Nothing waiting here"
                      description="New assignments and requests will appear as they arrive."
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
            title="Your workspace is ready"
            description="An administrator can assign the project permissions you need."
          />
        </div>
      )}
    </>
  );
}
