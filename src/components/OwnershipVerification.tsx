import { CheckCircle2, ClipboardCheck, KeyRound, ArrowLeftRight } from 'lucide-react';
import { t, useLocale } from '../lib/i18n';
import { date, humanize } from '../lib/format';
import { row } from '../lib/types';
import type { Row } from '../lib/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { projectRoot, resolvePath } from '../lib/contract';
import { usePreferences } from '../stores/preferences';
import { ownershipLabels, visibleVerificationEntries } from '../lib/ownership';
import './ownership-verification.css';

export function OwnershipParties({ bookingId, buyerId }: { bookingId: unknown; buyerId: unknown }) {
  useLocale();
  const projectId = usePreferences((state) => state.projectId);
  const booking = useQuery({
    queryKey: ['ownership-booking', projectId, bookingId],
    enabled: typeof bookingId === 'string',
    queryFn: ({ signal }) =>
      api<Row>(resolvePath(projectRoot + '/bookings/{id}', { id: String(bookingId) }), { signal }),
  });
  const buyer = useQuery({
    queryKey: ['ownership-buyer', projectId, buyerId],
    enabled: typeof buyerId === 'string',
    queryFn: ({ signal }) =>
      api<Row>(resolvePath(projectRoot + '/customers/{id}', { id: String(buyerId) }), { signal }),
  });
  return (
    <dl className="review-values ownership-parties">
      <div>
        <dt>{t('Booking')}</dt>
        <dd>{String(booking.data?.reference ?? t('Selected booking'))}</dd>
      </div>
      <div>
        <dt>{t('Property')}</dt>
        <dd>{String(row(booking.data?.unit).number ?? '—')}</dd>
      </div>
      <div>
        <dt>{t('Current customer')}</dt>
        <dd>{String(row(booking.data?.customer).name ?? '—')}</dd>
      </div>
      {Boolean(buyerId) && (
        <div>
          <dt>{t('New owner')}</dt>
          <dd>{String(buyer.data?.name ?? t('Selected customer'))}</dd>
        </div>
      )}
      {(booking.isError || buyer.isError) && (
        <div className="form-full">
          <p className="field-error">
            {t('Could not load party details. Go back to check your selection.')}
          </p>
        </div>
      )}
    </dl>
  );
}

export function OwnershipGuide({
  possession = false,
  compact = false,
}: {
  possession?: boolean;
  compact?: boolean;
}) {
  useLocale();
  const Icon = possession ? KeyRound : ArrowLeftRight;
  return (
    <aside className={'ownership-guide' + (compact ? ' ownership-guide-compact' : '')}>
      <Icon size={20} aria-hidden="true" />
      <div>
        <h3>
          {t(possession ? 'From inspection to handover' : 'Transfer with a complete case file')}
        </h3>
        {!compact && (
          <p>
            {t(
              possession
                ? 'Check ownership and possession release, record an inspection, resolve issues, then save the signed handover receipt.'
                : 'Choose the booking and new owner, verify the case documents, settle transfer charges, then complete the ownership change.',
            )}
          </p>
        )}
        <p>
          {t(
            'Requirements vary by authority and property type. Check the current rules for this case. A separate NDC is needed only where the authority requires it.',
          )}
        </p>
        {!compact && (
          <small>
            {t(
              'This system requires all scheduled booking dues to be cleared before transfer or possession. Official registration and authority approval are handled outside the dashboard.',
            )}
          </small>
        )}
      </div>
    </aside>
  );
}

export function VerificationSummary({ value }: { value: unknown }) {
  useLocale();
  const checks = row(value);
  return (
    <div className="verification-summary">
      <h4>
        <ClipboardCheck size={17} />
        {t('Case document checks')}
      </h4>
      <dl>
        {visibleVerificationEntries(checks).map(([key, val]) => (
          <div key={key} className={typeof val === 'boolean' ? 'verification-checked' : ''}>
            <dt>{t(ownershipLabels[key])}</dt>
            <dd>
              {typeof val === 'boolean' ? (
                <>
                  <CheckCircle2 size={15} />
                  {t(val ? 'Checked' : 'Not checked')}
                </>
              ) : key === 'clearanceStatus' ? (
                humanize(String(val))
              ) : key === 'clearanceValidUntil' ? (
                date(val)
              ) : (
                String(val)
              )}
            </dd>
          </div>
        ))}
      </dl>
      {Boolean(checks.verifiedAt) && (
        <small>
          {t('Reviewed on')} {date(checks.verifiedAt)}
        </small>
      )}
    </div>
  );
}
