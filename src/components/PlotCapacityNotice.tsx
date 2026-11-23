import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { t, useLocale } from '../lib/i18n';
import { can } from '../stores/auth';
import { usePreferences } from '../stores/preferences';
import './plot-capacity-notice.css';

export type PlotCapacity = {
  configured: boolean;
  plannedPlotCount: number | null;
  plannedPlotArea: string | null;
  plotAreaUnit: string | null;
  usedPlotCount: number;
  usedPlotArea: string | null;
  remainingPlotCount: number | null;
  remainingPlotArea: string | null;
  unmatchedPlotCount: number;
};

export function PlotCapacityNotice({ projectId: explicitProjectId }: { projectId?: string } = {}) {
  useLocale();
  const selectedProjectId = usePreferences((state) => state.projectId);
  const projectId = explicitProjectId ?? selectedProjectId;
  const capacity = useQuery({
    queryKey: ['plot-capacity', projectId],
    enabled: Boolean(projectId && can('projects.read')),
    refetchOnMount: 'always',
    queryFn: ({ signal }) => api<PlotCapacity>(`/projects/${projectId}/plot-capacity`, { signal }),
  });
  if (!projectId || !can('projects.read') || !capacity.data) return null;
  const plan = capacity.data;
  if (!plan.configured)
    return (
      <div className="plot-capacity-notice">
        <strong>{t('Project plot capacity')}</strong>
        <p>
          {t(
            'Set the planned plot count and total plot area in project details to track what remains.',
          )}
        </p>
      </div>
    );
  return (
    <section className="plot-capacity-notice" aria-label={t('Project plot capacity')}>
      <strong>{t('Project plot capacity')}</strong>
      <div className="plot-capacity-values">
        <div>
          <span>{t('Plots left')}</span>
          <b>{plan.remainingPlotCount}</b>
          <small>{t('of {0} planned', { '0': plan.plannedPlotCount ?? 0 })}</small>
        </div>
        <div>
          <span>{t('Area left')}</span>
          <b>
            {plan.remainingPlotArea ?? '—'} {plan.plotAreaUnit}
          </b>
          <small>
            {t('of {0} {1} planned', {
              '0': plan.plannedPlotArea ?? '',
              '1': plan.plotAreaUnit ?? '',
            })}
          </small>
        </div>
      </div>
      {plan.unmatchedPlotCount ? (
        <p>
          {t(
            '{0} existing plots use another area unit. Update them to see the accurate area left.',
            {
              '0': plan.unmatchedPlotCount,
            },
          )}
        </p>
      ) : (
        <p>{t('Residential and commercial plots must use the project area unit.')}</p>
      )}
    </section>
  );
}
