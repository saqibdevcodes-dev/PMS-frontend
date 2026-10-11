import { t, useLocale } from '../../lib/i18n';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Button, ErrorState } from '../../components/ui';
import { BrandLogo } from '../../components/BrandLogo';
import './portal.css';
export default function Activation() {
  useLocale();
  const [token, setToken] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '',
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    if (window.location.hash.startsWith('#token='))
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);
  return (
    <main className="portal-activation">
      <section className="portal-panel">
        <BrandLogo variant="app" className="activation-emblem" />
        <span className="eyebrow">{t('YOUR CUSTOMER PORTAL')}</span>
        <h1>{done ? t('You’re ready to sign in.') : t('Welcome to your property account.')}</h1>
        {done ? (
          <>
            <CheckCircle2 size={36} />
            <p>
              {t('Your invitation has been accepted. Sign in to see your properties and payments.')}
            </p>
            <Button asChild>
              <Link to="/portal/login">{t('Go to customer sign in')}</Link>
            </Button>
          </>
        ) : (
          <>
            <p>
              {t(
                'Set a password to activate your account. Already have a customer account? Enter its current password to link this property.',
              )}
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError(undefined);
                const values = new FormData(e.currentTarget);
                if (values.get('password') !== values.get('confirm')) {
                  setError(new Error(t('Passwords do not match.')));
                  return;
                }
                setBusy(true);
                try {
                  await api('/portal/activate', {
                    method: 'POST',
                    anonymous: true,
                    body: { token, password: String(values.get('password')) },
                  });
                  setToken('');
                  setDone(true);
                } catch (err) {
                  setError(err);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="form-field">
                <label htmlFor="invitation-token">{t('Invitation code')}</label>
                <input
                  id="invitation-token"
                  placeholder={t('Paste the code from your invitation email')}
                  autoComplete="off"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  minLength={32}
                  maxLength={200}
                />
              </div>
              <div className="form-field">
                <label htmlFor="portal-password">{t('Password')}</label>
                <input
                  name="password"
                  id="portal-password"
                  placeholder={t('Enter your password')}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                />
                <small>
                  {t('At least 12 characters, including uppercase, lowercase, and a number.')}
                </small>
              </div>
              <div className="form-field">
                <label htmlFor="portal-confirm">{t('Confirm password')}</label>
                <input
                  name="confirm"
                  id="portal-confirm"
                  placeholder={t('Enter the same password again')}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                />
              </div>
              {Boolean(error) && <ErrorState error={error} />}
              <Button type="submit" busy={busy}>
                {t('Activate customer access')}
              </Button>
            </form>
            <Link className="text-link" to="/forgot-password">
              {t('Forgot your existing password?')}
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
