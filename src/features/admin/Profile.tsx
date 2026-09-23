import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Monitor, ShieldCheck, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { api } from '../../lib/api';
import { operation } from '../../lib/contract';
import { asRows, type Row, type Operation } from '../../lib/types';
import { logout } from '../../hooks/use-auth';
import { PageHeading, Button, ErrorState } from '../../components/ui';
import { DataTable } from '../../components/DataTable';
import { OperationDialog } from '../../components/OperationDialog';
import {
  platform,
  enablePush,
  installationId,
  desktopUpdates,
  print,
} from '../../platform/adapter';
export default function Profile() {
  const user = useAuth((s) => s.user)!;
  const preferences = usePreferences();
  const [action, setAction] = useState<{
    operation: Operation;
    title: string;
    record?: Row;
  } | null>(null);
  const sessions = useQuery({
    queryKey: ['my-sessions'],
    queryFn: ({ signal }) => api('/auth/sessions', { signal }),
  });
  const signout = useMutation({
    mutationFn: () => logout(),
    onError: (e) => toast.error(e.message),
  });
  const updates = useQuery({
    queryKey: ['desktop-update'],
    enabled: !!desktopUpdates,
    queryFn: () => desktopUpdates!.status(),
    refetchInterval: desktopUpdates ? 5000 : false,
  });
  const push = useMutation({
    mutationFn: () =>
      enablePush(async (pushToken) => {
        const device = await api<{ id: string }>('/devices', {
          method: 'POST',
          body: { installationId: installationId(), platform: platform.name, pushToken },
        });
        localStorage.setItem('estate-device-' + user.id, device.id);
      }),
    onSuccess: () => toast.success('Push notifications enabled'),
    onError: (e) => toast.error(e.message),
  });
  const updateApp = useMutation({
    mutationFn: () => desktopUpdates!.check(),
    onSuccess: () => void updates.refetch(),
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <PageHeading
        eyebrow="Your account"
        title="Profile & security"
        description="Personal preferences and control over your active sessions."
        actions={
          <Button variant="secondary" busy={signout.isPending} onClick={() => signout.mutate()}>
            <LogOut size={16} />
            Sign out
          </Button>
        }
      />
      <div className="profile-grid">
        <section className="panel profile-card">
          <span className="avatar avatar-large">{user.name[0]}</span>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="profile-access">
            <ShieldCheck size={16} />
            {user.permissions.length} granted permissions
          </span>
          <div className="profile-projects">{user.projects.length} assigned projects</div>
        </section>
        <section className="panel preferences-card">
          <h2>Make yourself at home</h2>
          <p>Choose how your workspace looks on this device.</p>
          <div className="theme-options">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <button
                key={theme}
                aria-pressed={preferences.theme === theme}
                onClick={() => preferences.setTheme(theme)}
              >
                <span className={'theme-preview ' + theme} />
                <strong>{theme.charAt(0).toUpperCase() + theme.slice(1)}</strong>
              </button>
            ))}
          </div>
          <div className="security-actions">
            <Button
              variant="secondary"
              onClick={() =>
                setAction({
                  operation: operation('post', '/auth/change-password'),
                  title: 'Change password',
                })
              }
            >
              <KeyRound size={16} />
              Change password
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setAction({
                  operation: operation('post', '/auth/logout-all'),
                  title: 'Sign out on every device',
                })
              }
            >
              <ShieldCheck size={16} />
              Revoke all sessions
            </Button>
          </div>
        </section>
      </div>
      {platform.mobile && (
        <section className="panel preferences-card">
          <h2>Device notifications</h2>
          <p>Receive project reminders and approval notifications on this device.</p>
          <Button busy={push.isPending} onClick={() => push.mutate()}>
            Enable push notifications
          </Button>
        </section>
      )}
      {platform.desktop && (
        <section className="panel preferences-card">
          <h2>Desktop application</h2>
          <p>Estate PMS · Version {updates.data?.version ?? '1.0.0'}</p>
          <Button
            variant="secondary"
            onClick={() =>
              void Promise.resolve(print()).catch((e: Error) => toast.error(e.message))
            }
          >
            Print this view
          </Button>
          {updates.data?.status !== 'unconfigured' && (
            <Button
              busy={updateApp.isPending}
              onClick={() =>
                updates.data?.status === 'ready'
                  ? void desktopUpdates!.install()
                  : updateApp.mutate()
              }
            >
              {updates.data?.status === 'ready'
                ? 'Restart to install update'
                : updates.data?.status === 'available'
                  ? 'Download update'
                  : 'Check for updates'}
            </Button>
          )}
          {updates.data?.status === 'unconfigured' && (
            <p className="muted">
              Automatic updates are available after your administrator connects a release channel.
            </p>
          )}
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Active & recent sessions</h2>
            <p>Recognize every device with access to your account.</p>
          </div>
          <Monitor size={20} />
        </div>
        {sessions.isError ? (
          <ErrorState error={sessions.error} />
        ) : (
          <DataTable
            data={asRows(sessions.data)}
            columns={['platform', 'lastActivity', 'expiresAt', 'revokedAt']}
            busy={sessions.isLoading}
            controls={false}
            actions={(r) =>
              !r.revokedAt && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    setAction({
                      operation: operation('delete', '/auth/sessions/{id}'),
                      title: 'Revoke session',
                      record: r,
                    })
                  }
                >
                  Revoke
                </Button>
              )
            }
          />
        )}
      </section>
      {action && (
        <OperationDialog
          {...action}
          onClose={() => setAction(null)}
          onSuccess={() => {
            if (['/auth/change-password', '/auth/logout-all'].includes(action.operation.path)) {
              useAuth.getState().clear();
            }
          }}
        />
      )}
    </>
  );
}
