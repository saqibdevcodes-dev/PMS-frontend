import { t, useLocale } from '../../lib/i18n';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mail, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Button, Badge, ErrorState, Skeleton } from '../../components/ui';
import { date } from '../../lib/format';
export default function CustomerAccess({
  projectId,
  customerId,
}: {
  projectId: string;
  customerId: string;
}) {
  useLocale();
  const root = `/projects/${projectId}/customers/${customerId}/portal`;
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const query = useQuery({
    queryKey: ['customer-access', projectId, customerId],
    queryFn: () =>
      api<{
        status: string;
        email: string | null;
        expiresAt: string | null;
        canResendCredentials?: boolean;
      }>(root),
  });
  const mutation = useMutation({
    mutationFn: (action: 'invite' | 'revoke') =>
      api(root + (action === 'invite' ? '/invite' : ''), {
        method: action === 'invite' ? 'POST' : 'DELETE',
        body: {},
      }),
    onSuccess: (_data, action) => {
      setConfirm(false);
      setMessage(
        action === 'invite'
          ? 'Invitation queued for email delivery. The customer has 48 hours to activate access.'
          : 'Portal access and pending invitations revoked.',
      );
      void query.refetch();
    },
  });
  const resend = useMutation({
    mutationFn: () => api(root + '/resend-credentials', { method: 'POST', body: {} }),
    onSuccess: () => {
      setMessage(
        'New credentials queued for email delivery. The previous password no longer works.',
      );
      void query.refetch();
    },
  });
  return (
    <section className="portal-access-panel">
      <h3>
        <ShieldCheck size={18} />
        {t('Customer portal access')}
      </h3>
      <p>
        {t(
          'Send access to the email saved on this customer. Verify the address belongs to them before inviting.',
        )}
      </p>
      {query.isLoading ? (
        <Skeleton rows={2} />
      ) : query.isError ? (
        <ErrorState error={query.error} />
      ) : (
        <>
          <p>
            {query.data?.email ?? t('Add a customer email address first.')}{' '}
            <Badge value={query.data?.status} />
          </p>
          {query.data?.status === 'PENDING' && (
            <small>
              {t('Invitation expires')} {date(query.data.expiresAt)}
            </small>
          )}
          <div className="detail-actions">
            {query.data?.canResendCredentials && (
              <Button size="small" busy={resend.isPending} onClick={() => resend.mutate()}>
                <Mail size={15} />
                {t('Resend login credentials')}
              </Button>
            )}
            {!['ACTIVE', 'DISABLED'].includes(query.data?.status ?? '') && (
              <Button
                size="small"
                disabled={!query.data?.email}
                busy={mutation.isPending}
                onClick={() => mutation.mutate('invite')}
              >
                <Mail size={15} />
                {query.data?.status === 'PENDING' ? t('Resend invitation') : t('Invite customer')}
              </Button>
            )}
            {['ACTIVE', 'DISABLED', 'PENDING'].includes(query.data?.status ?? '') && (
              <Button
                size="small"
                variant="danger"
                disabled={mutation.isPending}
                onClick={() => setConfirm(true)}
              >
                {t('Revoke access')}
              </Button>
            )}
          </div>
          {query.data?.canResendCredentials && (
            <small>
              {t(
                'Available only until the customer first signs in. Resending generates a new password.',
              )}
            </small>
          )}
          {query.data?.status === 'ACTIVE' && !query.data.canResendCredentials && (
            <small>
              {t(
                'This account already has access. The customer can use Forgot password on the login screen.',
              )}
            </small>
          )}
        </>
      )}
      {confirm && (
        <div className="form-field">
          <p>
            {t(
              'This will unlink this customer, cancel pending invitations, and sign the customer out. Their business records will remain.',
            )}
          </p>
          <div className="detail-actions">
            <Button
              variant="danger"
              busy={mutation.isPending}
              onClick={() => mutation.mutate('revoke')}
            >
              {t('Confirm revoke')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              {t('Keep access')}
            </Button>
          </div>
        </div>
      )}
      {mutation.isError && <ErrorState error={mutation.error} />}
      {resend.isError && <ErrorState error={resend.error} />}
      <p role="status">{t(message)}</p>
    </section>
  );
}
