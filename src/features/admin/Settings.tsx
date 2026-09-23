import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ShieldCheck, Landmark } from 'lucide-react';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { api, queryString } from '../../lib/api';
import { operation, projectRoot } from '../../lib/contract';
import { asRows, type Row, type Operation } from '../../lib/types';
import { Button, PageHeading, ErrorState } from '../../components/ui';
import { OperationDialog } from '../../components/OperationDialog';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
export default function Settings() {
  const projectId = usePreferences((s) => s.projectId);
  const projectName = usePreferences((s) => s.projectName);
  const [action, setAction] = useState<{ operation: Operation; title: string } | null>(null);
  const query = useQuery({
    queryKey: ['settings', projectId],
    enabled: !!projectId && can('settings.manage'),
    queryFn: ({ signal }) => api(`/projects/${projectId}/settings`, { signal }),
  });
  const project = useQuery({
    queryKey: ['project-settings-record', projectId, projectName],
    enabled: !!projectId && can('settings.manage'),
    queryFn: async ({ signal }) => {
      const result = await api('/projects' + queryString({ search: projectName, limit: 100 }), {
        signal,
      });
      const found = asRows(result).find((item) => item.id === projectId);
      if (!found)
        throw new Error('Reload the project list to retrieve the current business rules.');
      return found;
    },
  });
  if (!can('settings.manage')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  const choices = [
    {
      icon: SlidersHorizontal,
      title: 'Business rules',
      description: 'Reservation expiry, down payments, grace periods, and project details.',
      op: operation('patch', projectRoot),
    },
    {
      icon: Landmark,
      title: 'Accounting mappings',
      description: 'Select the ledger accounts used by verified operational events.',
      op: operation('post', projectRoot + '/settings/accounting'),
    },
    {
      icon: ShieldCheck,
      title: 'Approval policies',
      description: 'Set amount thresholds and sequential permission levels for business decisions.',
      op: operation('post', projectRoot + '/approval-policies'),
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Project settings"
        description="Configure the rules that keep your project running consistently."
      />
      <div className="finance-modules">
        {choices
          .filter((c) => can(c.op.permission))
          .map((choice) => (
            <section className="panel" key={choice.title}>
              <span className="finance-icon">
                <choice.icon size={23} />
              </span>
              <h2>{choice.title}</h2>
              <p>{choice.description}</p>
              <Button
                variant="secondary"
                disabled={choice.op.method === 'patch' && !project.data}
                onClick={() => setAction({ operation: choice.op, title: choice.title })}
              >
                Configure
              </Button>
            </section>
          ))}
      </div>
      {query.isError && <ErrorState error={query.error} />}
      {project.isError && <ErrorState error={project.error} retry={() => void project.refetch()} />}
      <section className="panel settings-current">
        <div className="panel-heading">
          <div>
            <h2>Current settings</h2>
            <p>Recorded configuration for the selected project</p>
          </div>
        </div>
        {asRows(query.data).map((r) => (
          <div key={r.id ?? String(r.key)}>
            <h3>{String(r.key)}</h3>
            <dl className="detail-grid">
              {Object.entries(r.value && typeof r.value === 'object' ? (r.value as Row) : {}).map(
                ([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>
                      <code>{String(v)}</code>
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </div>
        ))}
      </section>
      {action && (
        <OperationDialog {...action} record={project.data} onClose={() => setAction(null)} />
      )}
    </>
  );
}
