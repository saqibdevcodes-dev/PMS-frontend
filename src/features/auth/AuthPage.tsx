import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Building2, ArrowRight, Eye, EyeOff, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../../hooks/use-auth';
import { useAuth } from '../../stores/auth';
import { api } from '../../lib/api';
import { Button, ErrorState } from '../../components/ui';
const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
export default function AuthPage() {
  const user = useAuth((s) => s.user);
  const location = useLocation();
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
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link to="/login" className="brand">
          <span className="brand-mark">
            <Building2 size={24} />
          </span>
          <span>
            estate<span className="blue">.</span>
          </span>
        </Link>
        <div className="auth-copy">
          <div className="eyebrow">YOUR PROPERTY OPERATIONS, CONNECTED</div>
          <h1>
            Big picture.
            <br />
            Every detail.
          </h1>
          <p>
            A clearer way to manage properties, build customer relationships, and keep your business
            moving.
          </p>
        </div>
        <div className="architecture-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="art-building building-one" />
          <div className="art-building building-two" />
          <div className="art-building building-three" />
          <div className="art-caption">
            <span className="live-dot" />
            One connected workspace
            <ArrowUpRight size={18} />
          </div>
        </div>
        <footer>
          <span>Built for the way property teams work.</span>
          <span>WEB · DESKTOP · MOBILE</span>
        </footer>
      </aside>
      <main className="auth-main">
        <div className="auth-top">
          <span>PROPERTY MANAGEMENT SYSTEM</span>
          <ShieldCheck size={18} />
        </div>
        <div className="auth-form">
          <span className="auth-welcome">YOUR WORKSPACE AWAITS</span>
          <h2>
            {mode === 'login'
              ? 'Welcome back.'
              : mode === 'forgot'
                ? 'Forgot your password?'
                : 'Set a new password.'}
          </h2>
          <p>
            {mode === 'login'
              ? 'Sign in to bring your portfolio into focus.'
              : mode === 'forgot'
                ? 'We’ll send recovery instructions to your email.'
                : 'Enter your recovery token and choose a strong password.'}
          </p>
          {message ? (
            <div className="notice-success">
              {message}
              <Link to="/login">
                Return to sign in <ArrowRight size={14} />
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
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <small className="field-error">{form.formState.errors.email.message}</small>
                )}
              </div>
              <div className="form-field">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <div className="password-field">
                  <input
                    id="password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
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
                Sign in to workspace
                <ArrowRight size={17} />
              </Button>
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
                  <label htmlFor="recovery-email">Email address</label>
                  <input id="recovery-email" name="email" type="email" required />
                </div>
              ) : (
                <>
                  <div className="form-field">
                    <label htmlFor="token">Recovery token</label>
                    <input id="token" name="token" required autoComplete="one-time-code" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="new-password">New password</label>
                    <input
                      id="new-password"
                      name="password"
                      type="password"
                      minLength={12}
                      maxLength={128}
                      required
                      autoComplete="new-password"
                    />
                    <small>At least 12 characters, with uppercase, lowercase, and a number.</small>
                  </div>
                </>
              )}
              {Boolean(error) && <ErrorState error={error} />}
              <Button type="submit" busy={busy} className="auth-submit">
                {mode === 'forgot' ? 'Send recovery instructions' : 'Reset password'}
              </Button>
              <Link className="auth-back" to="/login">
                Back to sign in
              </Link>
              {mode === 'forgot' && (
                <Link className="auth-back" to="/reset-password">
                  I already have a recovery token
                </Link>
              )}
            </form>
          )}
          <div className="auth-security">
            <ShieldCheck size={15} />
            <span>Secure access. Your permissions follow you everywhere.</span>
          </div>
        </div>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} Estate Workspace</span>
          <span>Online-first. Always in sync.</span>
        </footer>
      </main>
    </div>
  );
}
