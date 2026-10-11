import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../../hooks/use-auth';
import { useAuth } from '../../stores/auth';
import { api } from '../../lib/api';
import { Button, ErrorState } from '../../components/ui';
import { BrandLogo } from '../../components/BrandLogo';
const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
export default function AuthPage() {
  useLocale();
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const customerLogin = location.pathname.startsWith('/portal');
  const mode = location.pathname.includes('forgot')
    ? 'forgot'
    : location.pathname.includes('reset')
      ? 'reset'
      : 'login';
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<unknown>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  if (user)
    return <Navigate to={user.accountType === 'CUSTOMER' ? '/portal' : '/dashboard'} replace />;
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link to="/login" className="brand" aria-label="Etihad Real Estate">
          <span className="auth-logo-full bg-white/80 rounded p-1 shadow-sm shadow-gray-200">
            <img src="/logo2.png" alt="" width={1448} height={444} />
          </span>
        </Link>
        <div className="auth-copy">
          <div className="eyebrow">
            {customerLogin
              ? t('YOUR PROPERTY ACCOUNT, CONNECTED')
              : t('YOUR PROPERTY OPERATIONS, CONNECTED')}
          </div>
          <h1>
            {t('Big picture.')}
            <br />
            {t('Every detail.')}
          </h1>
          <p>
            {customerLogin
              ? t(
                  'Your properties, payment schedule, receipts, and important documents. All in one secure place.',
                )
              : t(
                  'A clearer way to manage properties, build customer relationships, and keep your business moving.',
                )}
          </p>
        </div>
        <div className="architecture-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="art-building building-one" />
          <div className="art-building building-two" />
          <div className="art-building building-three" />
          <div className="art-caption">
            <span className="live-dot" />
            {t('One connected workspace')}
            <ArrowUpRight size={18} />
          </div>
        </div>
        <footer>
          <span>{t('Built for the way property teams work.')}</span>
          <span>{t('WEB · DESKTOP · MOBILE')}</span>
        </footer>
      </aside>
      <main className="auth-main">
        <Link to="/login" className="auth-mobile-logo" aria-label="Etihad Real Estate">
          <BrandLogo variant="stacked" decorative />
        </Link>
        <div className="auth-top">
          <span>{t('PROPERTY MANAGEMENT SYSTEM')}</span>
          <ShieldCheck size={18} />
        </div>
        <div className="auth-form">
          <span className="auth-welcome">
            {customerLogin ? t('YOUR CUSTOMER PORTAL') : t('YOUR WORKSPACE AWAITS')}
          </span>
          <h2>
            {mode === 'login'
              ? t('Welcome back.')
              : mode === 'forgot'
                ? t('Forgot your password?')
                : t('Set a new password.')}
          </h2>
          <p>
            {mode === 'login'
              ? t('Sign in to bring your portfolio into focus.')
              : mode === 'forgot'
                ? t('We’ll send recovery instructions to your email.')
                : t('Enter your recovery token and choose a strong password.')}
          </p>
          {message ? (
            <div className="notice-success">
              {message}
              <Link to="/login">
                {t('Return to sign in')} <ArrowRight size={14} />
              </Link>
            </div>
          ) : mode === 'login' ? (
            <form
              onSubmit={form.handleSubmit(async (values) => {
                setError(undefined);
                setBusy(true);
                try {
                  await login(values.email, values.password);
                } catch (e) {
                  setError(e);
                } finally {
                  setBusy(false);
                }
              })}
              noValidate
            >
              <div className="form-field">
                <label htmlFor="email">{t('Email address')}</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder={t('you@company.com')}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <small className="field-error">{form.formState.errors.email.message}</small>
                )}
              </div>
              <div className="form-field">
                <div className="label-row">
                  <label htmlFor="password">{t('Password')}</label>
                  <Link to="/forgot-password">{t('Forgot password?')}</Link>
                </div>
                <div className="password-field">
                  <input
                    id="password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('Enter your password')}
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    aria-label={visible ? t('Hide password') : t('Show password')}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <small className="field-error">{form.formState.errors.password.message}</small>
                )}
              </div>
              {Boolean(error) && <ErrorState error={error} />}
              <Button type="submit" className="auth-submit" busy={busy}>
                {customerLogin ? t('Sign in to customer portal') : t('Sign in to workspace')}
                <ArrowRight size={17} />
              </Button>
              <Link className="text-link" to={customerLogin ? '/login' : '/portal/login'}>
                {customerLogin ? t('Staff sign in') : t('Customer portal sign in')}
              </Link>
            </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setBusy(true);
                setError(undefined);
                try {
                  const payload =
                    mode === 'forgot'
                      ? { email: String(data.get('email')) }
                      : {
                          token: String(data.get('token')),
                          password: String(data.get('password')),
                        };
                  await api('/auth/' + (mode === 'forgot' ? 'forgot-password' : 'reset-password'), {
                    method: 'POST',
                    body: payload,
                    anonymous: true,
                  });
                  setMessage(
                    mode === 'forgot'
                      ? 'If that account exists, recovery instructions have been sent.'
                      : 'Your password has been changed. Sign in with your new password.',
                  );
                } catch (err) {
                  setError(err);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {mode === 'forgot' ? (
                <div className="form-field">
                  <label htmlFor="recovery-email">{t('Email address')}</label>
                  <input
                    id="recovery-email"
                    placeholder={t('you@company.com')}
                    name="email"
                    type="email"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="form-field">
                    <label htmlFor="token">{t('Recovery token')}</label>
                    <input
                      id="token"
                      placeholder={t('Paste the code from your recovery email')}
                      name="token"
                      required
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="new-password">{t('New password')}</label>
                    <input
                      id="new-password"
                      placeholder={t('Create a strong password')}
                      name="password"
                      type="password"
                      minLength={12}
                      maxLength={128}
                      required
                      autoComplete="new-password"
                    />
                    <small>
                      {t('At least 12 characters, with uppercase, lowercase, and a number.')}
                    </small>
                  </div>
                </>
              )}
              {Boolean(error) && <ErrorState error={error} />}
              <Button type="submit" busy={busy} className="auth-submit">
                {mode === 'forgot' ? t('Send recovery instructions') : t('Reset password')}
              </Button>
              <Link className="auth-back" to="/login">
                {t('Back to sign in')}
              </Link>
              {mode === 'forgot' && (
                <Link className="auth-back" to="/reset-password">
                  {t('I already have a recovery token')}
                </Link>
              )}
            </form>
          )}
          <div className="auth-security">
            <ShieldCheck size={15} />
            <span>{t('Secure access. Your permissions follow you everywhere.')}</span>
          </div>
        </div>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} etihadrealestate</span>
          <span>{t('Online-first. Always in sync.')}</span>
        </footer>
      </main>
    </div>
  );
}
