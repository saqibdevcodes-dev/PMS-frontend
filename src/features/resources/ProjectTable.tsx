import { Building2, Clock3, MapPin, Sparkles } from 'lucide-react';
import { t } from '../../lib/i18n';
import type { Row } from '../../lib/types';
import './project-table.css';

export const projectColumnLabels = {
  name: 'Project',
  location: 'Location',
  features: 'Amenities',
  paymentRules: 'Payment rules',
  regionalSettings: 'Currency & timezone',
  createdAt: 'Created at',
  actions: 'Actions',
};

export function ProjectTableHeading() {
  return (
    <div className="project-directory-heading">
      <span className="project-directory-icon">
        <Building2 size={20} aria-hidden />
      </span>
      <div>
        <h2>{t('Project directory')}</h2>
        <p>{t('Locations, amenities and payment settings at a glance.')}</p>
      </div>
    </div>
  );
}

export function projectCell(column: string, record: Row) {
  if (column === 'location') {
    const location = String(record.location ?? '').trim();
    const description = String(record.description ?? '').trim();
    return (
      <div className="project-cell-stack project-location">
        <span className={location ? '' : 'muted'} title={location}>
          <MapPin size={13} aria-hidden />
          <span>{location || t('Not added yet')}</span>
        </span>
        {description && <small title={description}>{description}</small>}
      </div>
    );
  }
  if (column === 'features') {
    const features = Array.isArray(record.features)
      ? record.features.filter((feature): feature is string => typeof feature === 'string')
      : [];
    return features.length ? (
      <div className="project-cell-stack">
        <span className="project-amenity" title={t(features[0])}>
          <Sparkles size={13} aria-hidden />
          <span>{t(features[0])}</span>
        </span>
        {features.length > 1 && (
          <small
            title={features
              .slice(1)
              .map((feature) => t(feature))
              .join(', ')}
          >
            {t('+{count} more', { count: features.length - 1 })}
          </small>
        )}
      </div>
    ) : (
      <span className="muted">{t('Not added yet')}</span>
    );
  }
  if (column === 'paymentRules') {
    const percent = record.downPaymentPercent;
    const days = record.ndcValidityDays;
    return (
      <div className="project-cell-stack project-payment-rules">
        <span title={t('Minimum down payment applies only to installment bookings.')}>
          <strong>{percent === undefined || percent === null ? '—' : `${Number(percent)}%`}</strong>
          <span>{t('Min. down payment')}</span>
        </span>
        <small title={t('Clearance certificate validity')}>
          {days === undefined || days === null
            ? '—'
            : t('Clearance: {count} days', { count: days })}
        </small>
      </div>
    );
  }
  if (column === 'regionalSettings') {
    return (
      <div className="project-cell-stack">
        <span className="project-currency">{String(record.currency ?? '—')}</span>
        <small className="project-timezone" title={String(record.timezone ?? '')}>
          <Clock3 size={12} aria-hidden />
          <span>{String(record.timezone ?? '—')}</span>
        </small>
      </div>
    );
  }
  return undefined;
}
