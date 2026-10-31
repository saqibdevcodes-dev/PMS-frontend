import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { BrandLogo } from '../../components/BrandLogo';
import { Button, Skeleton, ErrorState, Badge } from '../../components/ui';
import { date, humanize } from '../../lib/format';
import { t, useLocale } from '../../lib/i18n';
import './portal.css';

type PublicVerification = {
  valid: boolean;
  reference?: string;
  employeeCode?: string;
  customerCode?: string;
  name?: string;
  status?: string;
  projectName?: string;
  propertyNumber?: string;
  propertyType?: string;
  verifiedAt?: string;
  message?: string;
};

export default function VerificationPage() {
  useLocale();
  const [params, setParams] = useSearchParams();
  const route = useParams<{ ref?: string }>();
  const lookup =
    params.get('employee') || params.get('customer') || params.get('ref') || route.ref || '';
  const kind =
    params.has('employee') || /^(EMP|USR)-/i.test(lookup)
      ? 'employee'
      : params.has('customer') || /^(MEM|CUST|CUS)-/i.test(lookup)
        ? 'customer'
        : 'file';
  const [input, setInput] = useState(lookup);
  const query = useQuery({
    queryKey: ['public-verification', kind, lookup],
    enabled: Boolean(lookup.trim()),
    queryFn: ({ signal }) =>
      api<PublicVerification>(`/verify/${kind}/${encodeURIComponent(lookup.trim())}`, {
        anonymous: true,
        signal,
      }),
  });
  const result = query.data;
  const fields: [string, string | undefined][] = [
    ['Registration code', result?.reference || result?.customerCode || result?.employeeCode],
    ['Project', result?.projectName],
    ['Property', result?.propertyNumber],
    ['Property type', result?.propertyType ? humanize(result.propertyType) : undefined],
    ['Staff name', kind === 'employee' ? result?.name : undefined],
    ['Verified on', result?.verifiedAt ? date(result.verifiedAt) : undefined],
  ];
  return (
    <div className="portal-auth-layout">
      <div className="portal-auth-card" style={{ maxWidth: 640 }}>
        <header className="portal-auth-header">
          <BrandLogo variant="full" className="portal-auth-logo" />
          <h1>{t('Official registration verification')}</h1>
          <p>
            {t(
              'Check a complete file reference, staff code or customer code against the registry.',
            )}
          </p>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = input.trim();
            if (!value) return;
            setParams(
              /^(EMP|USR)-/i.test(value)
                ? { employee: value }
                : /^(MEM|CUST|CUS)-/i.test(value)
                  ? { customer: value }
                  : { ref: value },
            );
          }}
          className="form-grid"
          style={{ marginBottom: 24 }}
        >
          <label className="form-field">
            {t('Registration reference or code')}
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              required
              minLength={8}
              maxLength={80}
              placeholder="BKG-00000001 / MEM-1234ABCD"
            />
          </label>
          <Button type="submit" busy={query.isFetching}>
            {t('Verify')}
          </Button>
        </form>
        {query.isLoading ? (
          <Skeleton rows={3} />
        ) : query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : (
          result && (
            <section className="panel" style={{ padding: 24 }} aria-live="polite">
              {result.valid ? (
                <ShieldCheck size={32} color="var(--success)" />
              ) : (
                <ShieldAlert size={32} color="var(--danger)" />
              )}
              <h2>{t(result.valid ? 'Official registration verified' : 'No record found')}</h2>
              <p>
                {t(
                  result.message ||
                    (result.valid
                      ? 'The registration exists in the official registry.'
                      : 'Check the complete code and try again.'),
                )}
              </p>
              {result.status && <Badge value={result.status} />}
              {result.valid && (
                <dl className="detail-grid">
                  {fields
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt>{t(label)}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
              )}
            </section>
          )
        )}
        <p className="muted">
          {t(
            'Financial records and personal identity details are available only after an authorized sign-in.',
          )}
        </p>
        <Button asChild variant="secondary">
          <Link to="/portal/login">{t('Customer sign in')}</Link>
        </Button>
      </div>
    </div>
  );
}
