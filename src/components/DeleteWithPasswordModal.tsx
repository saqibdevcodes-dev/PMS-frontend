import { useEffect, useId, useState } from 'react';
import { AlertTriangle, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { t, useLocale } from '../lib/i18n';
import { api } from '../lib/api';
import { errorMessage } from '../lib/error-messages';
import { Modal, Button } from './ui';

interface DeleteWithPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  itemType: string;
  itemName: string;
  apiPath: string;
  warningMessage?: string;
}

export function DeleteWithPasswordModal({
  open,
  onClose,
  onSuccess,
  title,
  itemType,
  itemName,
  apiPath,
  warningMessage,
}: DeleteWithPasswordModalProps) {
  useLocale();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordId = useId();
  useEffect(() => {
    setPassword('');
    setError(null);
  }, [open, apiPath]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t('Administrator password is required to confirm deletion.'));
      return;
    }

    try {
      setBusy(true);
      setError(null);
      await api(apiPath, {
        method: 'DELETE',
        body: { password },
      });
      toast.success(t('{0} deleted successfully', { '0': itemName || itemType }));
      onSuccess();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      beforeClose={() => !busy}
      title={title}
      description={t('Permanent deletion confirmation with administrator verification')}
    >
      <form onSubmit={handleDelete} className="modal-body dialog-stack delete-confirm-form">
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--danger, #ef4444) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--danger, #ef4444) 30%, transparent)',
            color: 'var(--text)',
          }}
        >
          <AlertTriangle
            size={22}
            style={{ color: 'var(--danger, #ef4444)', flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <strong style={{ display: 'block', color: 'var(--danger, #ef4444)', marginBottom: 2 }}>
              {t('Warning: This action cannot be undone')}
            </strong>
            <span>
              {warningMessage ||
                t(
                  'This permanently deletes {name}. Records with payments, ownership changes, or other financial history cannot be deleted.',
                  { name: itemName },
                )}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            id={`${passwordId}-error`}
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: 'color-mix(in srgb, var(--danger, #ef4444) 15%, transparent)',
              color: 'var(--danger, #ef4444)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor={passwordId}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}
          >
            {t('Confirm by entering your administrator password:')}
          </label>
          <div className="input-icon">
            <input
              id={passwordId}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('Enter current administrator password')}
              autoFocus
              disabled={busy}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={`${passwordId}-hint${error ? ` ${passwordId}-error` : ''}`}
            />
            <Lock size={16} aria-hidden="true" />
          </div>
          <span id={`${passwordId}-hint`} style={{ fontSize: 12, color: 'var(--muted)' }}>
            {t('Verification is required to safeguard financial and inventory integrity.')}
          </span>
        </div>

        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            variant="danger"
            busy={busy}
            disabled={!password.trim()}
            style={{ gap: 6 }}
          >
            <Trash2 size={15} />
            {t('Delete permanently')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
