import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { api } from '../../lib/api';
import { operation, projectRoot } from '../../lib/contract';
import type { Row } from '../../lib/types';
import { Button, PageHeading, ErrorState } from '../../components/ui';
import { OperationDialog } from '../../components/OperationDialog';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import { LanguageSelector } from '../../components/LanguageSelector';
import { SlidersHorizontal, Percent, CalendarCheck, Pencil } from 'lucide-react';
import { Skeleton } from '../../components/ui';
export default function Settings() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [editing, setEditing] = useState(false);
  const project = useQuery({
    queryKey: ['project-settings', projectId],
    enabled: !!projectId && can('projects.update'),
    queryFn: () => api<Row>(`/projects/${projectId}`),
  });
  if (!can('projects.update')) return <Unauthorized />;
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Project settings"
        description="Set simple payment rules for this project."
      />
      {can('settings.manage') && (
        <section className="panel language-settings">
          <div>
            <h2>{t('System language')}</h2>
            <p>{t('Choose the language used throughout your workspace.')}</p>
          </div>
          <LanguageSelector />
        </section>
      )}
      {!projectId ? (
        <ProjectRequired />
      ) : (
        <section className="panel project-settings-card">
          <header className="workspace-card-heading">
            <div>
              <span className="workspace-eyebrow">
                {String(project.data?.name ?? t('Current project'))}
              </span>
              <h2>{t('Payments & clearance')}</h2>
              <p>
                {t("Manage the rules used for this project's bookings and clearance certificates.")}
              </p>
            </div>
            <span className="workspace-icon">
              <SlidersHorizontal size={22} />
            </span>
          </header>
          {project.error && <ErrorState error={project.error} />}
          {project.isPending ? (
            <Skeleton rows={2} />
          ) : (
            project.data && (
              <dl className="settings-rule-grid">
                <div>
                  <dt>
                    <Percent size={18} />
                    {t('Minimum down payment')}
                  </dt>
                  <dd>
                    {String(project.data.downPaymentPercent)}
                    <small>%</small>
                  </dd>
                  <p>
                    {t(
                      'Required for installment bookings. Full-payment bookings have no down-payment requirement.',
                    )}
                  </p>
                </div>
                <div>
                  <dt>
                    <CalendarCheck size={18} />
                    {t('Clearance certificate validity')}
                  </dt>
                  <dd>
                    {String(project.data.ndcValidityDays)} <small>{t('days')}</small>
                  </dd>
                  <p>{t('The period a clearance certificate remains valid after it is issued.')}</p>
                </div>
              </dl>
            )
          )}
          <footer className="settings-card-footer">
            <span className="muted">{t('Review these rules before creating new bookings.')}</span>
            <Button disabled={!project.data} onClick={() => setEditing(true)}>
              <Pencil size={15} />
              {t('Edit settings')}
            </Button>
          </footer>
        </section>
      )}
      {editing && (
        <OperationDialog
          title="Edit project settings"
          operation={operation('patch', projectRoot + '/settings')}
          record={project.data}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
