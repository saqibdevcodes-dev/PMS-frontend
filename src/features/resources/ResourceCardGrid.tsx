import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  Building2,
  Clock3,
  Grid2X2,
  Landmark,
  MapPin,
  Ruler,
  Sparkles,
  Users,
} from 'lucide-react';
import { RecordImage } from '../../components/ImageUpload';
import { Money } from '../../components/Money';
import { Badge } from '../../components/ui';
import { humanize, labelOf } from '../../lib/format';
import { t, useLocale } from '../../lib/i18n';
import { row, type Row } from '../../lib/types';

type DirectoryKind = 'companies' | 'projects' | 'inventory' | 'customers';

const text = (value: unknown) => String(value ?? '').trim();
const count = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0);

function CardMedia({ kind, record }: { kind: DirectoryKind; record: Row }) {
  const Icon =
    kind === 'companies'
      ? Landmark
      : kind === 'projects'
        ? Building2
        : kind === 'customers'
          ? Users
          : Grid2X2;
  const imageId = text(
    kind === 'companies'
      ? record.logoId
      : (record.photoId ?? (kind === 'projects' ? record.logoId : '')),
  );
  const status =
    kind === 'companies'
      ? (record.active === false ? 'INACTIVE' : 'ACTIVE')
      : kind === 'customers'
        ? record.paymentStatus
        : record.status;
  const codeLabel =
    text(record.code) ||
    text(record.reference) ||
    (kind === 'companies'
      ? t('Companies')
      : kind === 'projects'
        ? t('Project')
        : kind === 'customers'
          ? t('Customer')
          : t('Property'));

  if (kind === 'customers') {
    const initials = labelOf(record)
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

    return (
      <div className="directory-card-media directory-card-media--customer">
        <span className="directory-card-shade" />
        <span className="directory-card-code">{codeLabel}</span>
        {status ? (
          <span className="directory-card-status">
            <Badge value={status} />
          </span>
        ) : null}
        <div className="directory-card-avatar-wrap">
          <RecordImage
            id={imageId || undefined}
            alt={labelOf(record)}
            className="directory-card-avatar-img"
            fallback={
              <span className="directory-card-avatar-fallback" aria-hidden>
                {initials || <Icon size={34} />}
              </span>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="directory-card-media">
      <RecordImage
        id={imageId || undefined}
        alt={labelOf(record)}
        className="directory-card-image"
        fallback={
          <span className="directory-card-image directory-card-fallback" aria-hidden>
            <Icon size={34} />
          </span>
        }
      />
      <span className="directory-card-shade" />
      <span className="directory-card-code">{codeLabel}</span>
      {status ? (
        <span className="directory-card-status">
          <Badge value={status} />
        </span>
      ) : null}
    </div>
  );
}

function CompanyBody({ record }: { record: Row }) {
  const totals = row(record._count);
  const contact = [text(record.phone), text(record.email)].filter(Boolean).join(' · ');
  return (
    <>
      <p className="directory-card-location">
        <MapPin size={14} aria-hidden />
        <span>{text(record.address) || t('Not added yet')}</span>
      </p>
      <p className="directory-card-description">{contact || t('Not added yet')}</p>
      <dl className="directory-card-stats">
        <div>
          <dt>{t('Projects')}</dt>
          <dd>{count(totals.projects ?? record.projectsCount)}</dd>
        </div>
        <div>
          <dt>{t('Team members')}</dt>
          <dd>{count(totals.members ?? record.membersCount)}</dd>
        </div>
      </dl>
    </>
  );
}

function ProjectBody({ record }: { record: Row }) {
  const totals = row(record._count);
  const features = Array.isArray(record.features)
    ? record.features.filter(
        (feature): feature is string => typeof feature === 'string' && !!feature,
      )
    : [];
  return (
    <>
      <p className="directory-card-location">
        <MapPin size={14} aria-hidden />
        <span>{text(record.location) || t('Not added yet')}</span>
      </p>
      <p className="directory-card-description">
        {text(record.description) || t('Locations, amenities and payment settings at a glance.')}
      </p>
      <div className="directory-card-tags" aria-label={t('Amenities')}>
        {features.length ? (
          <>
            {features.slice(0, 2).map((feature) => (
              <span key={feature} title={t(feature)}>
                <Sparkles size={11} aria-hidden />
                {t(feature)}
              </span>
            ))}
            {features.length > 2 && (
              <span>{t('+{count} more', { count: features.length - 2 })}</span>
            )}
          </>
        ) : (
          <span>{t('Not added yet')}</span>
        )}
      </div>
      <dl className="directory-card-stats directory-card-stats--three">
        <div>
          <dt>{t('Properties')}</dt>
          <dd>{count(totals.units ?? record.totalProperties)}</dd>
        </div>
        <div>
          <dt>{t('Available')}</dt>
          <dd>{count(record.availableProperties)}</dd>
        </div>
        <div>
          <dt>{t('Currency & timezone')}</dt>
          <dd className="directory-card-region">
            {text(record.currency) || 'PKR'}
            <small>
              <Clock3 size={10} aria-hidden /> {text(record.timezone) || 'Asia/Karachi'}
            </small>
          </dd>
        </div>
      </dl>
    </>
  );
}

function PropertyBody({ record }: { record: Row }) {
  const place = [text(record.phase), text(record.block)].filter(Boolean).join(' / ');
  const area = [text(record.size), text(record.measurementUnit)].filter(Boolean).join(' ');
  return (
    <>
      <p className="directory-card-location">
        <MapPin size={14} aria-hidden />
        <span>{place || t('Not added yet')}</span>
      </p>
      <p className="directory-card-description">
        {record.type ? humanize(text(record.type)) : t('Property')}
      </p>
      <dl className="directory-card-stats">
        <div>
          <dt>
            <Ruler size={12} aria-hidden /> {t('Area')}
          </dt>
          <dd>{area || '—'}</dd>
        </div>
        <div>
          <dt>{t('Price')}</dt>
          <dd className="directory-card-price">
            <Money value={record.price} compact />
          </dd>
        </div>
      </dl>
    </>
  );
}

function CustomerBody({ record }: { record: Row }) {
  const contact = [text(record.phone), text(record.email)].filter(Boolean).join(' · ');
  const father = text(record.fatherName);
  const address = text(record.address);
  const bookings = Array.isArray(record.bookings) ? record.bookings : [];
  const identity = text(record.identityLast4);
  const idType = text(record.identityType) || 'ID';

  return (
    <>
      <p className="directory-card-location">
        <MapPin size={14} aria-hidden />
        <span>{address || (father ? `S/O ${father}` : t('Not added yet'))}</span>
      </p>
      <p className="directory-card-description">{contact || t('Not added yet')}</p>
      <div className="directory-card-tags" aria-label={t('Personal & Identity')}>
        {identity && (
          <span>
            {idType}: •••• {identity}
          </span>
        )}
        {father && address && <span>S/O {father}</span>}
        {bookings.length > 0 && (
          <span>
            <Building2 size={11} aria-hidden />
            {bookings.length} {t('Bookings')}
          </span>
        )}
      </div>
      <dl className="directory-card-stats">
        <div>
          <dt>
            <Building2 size={12} aria-hidden /> {t('Properties')}
          </dt>
          <dd>{count(bookings.length)}</dd>
        </div>
        <div>
          <dt>{t('Identity')}</dt>
          <dd className="directory-card-identity">
            {identity ? `•••• ${identity}` : '—'}
          </dd>
        </div>
      </dl>
    </>
  );
}

export function ResourceCardGrid({
  kind,
  records,
  onOpen,
  actions,
}: {
  kind: DirectoryKind;
  records: Row[];
  onOpen: (record: Row) => void;
  actions: (record: Row) => ReactNode;
}) {
  useLocale();
  return (
    <div className="directory-card-grid" data-directory={kind}>
      {records.map((record) => (
        <article className="directory-card" key={text(record.id)}>
          <CardMedia kind={kind} record={record} />
          <div className="directory-card-content">
            <header>
              <h3
                title={labelOf(record)}
                onClick={() => onOpen(record)}
                style={{ cursor: 'pointer' }}
              >
                {labelOf(record)}
              </h3>
            </header>
            {kind === 'companies' ? (
              <CompanyBody record={record} />
            ) : kind === 'projects' ? (
              <ProjectBody record={record} />
            ) : kind === 'customers' ? (
              <CustomerBody record={record} />
            ) : (
              <PropertyBody record={record} />
            )}
          </div>
          <footer className="directory-card-footer">
            <button
              type="button"
              className="directory-card-open"
              onClick={() => onOpen(record)}
              aria-label={`${t('View details')}: ${labelOf(record)}`}
            >
              {t('View details')}
              <ArrowUpRight size={14} aria-hidden />
            </button>
            <div className="directory-card-actions">{actions(record)}</div>
          </footer>
        </article>
      ))}
    </div>
  );
}

export function ResourceCardSkeletons() {
  return (
    <div className="directory-card-grid" aria-label={t('Loading records')} aria-busy="true">
      {[0, 1, 2].map((item) => (
        <div className="directory-card directory-card-skeleton" key={item}>
          <span className="skeleton" />
          <div>
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
