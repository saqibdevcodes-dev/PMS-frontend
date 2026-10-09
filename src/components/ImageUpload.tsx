import { t, useLocale } from '../lib/i18n';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus } from 'lucide-react';
import { api } from '../lib/api';
import { usePreferences } from '../stores/preferences';
import { Button, ErrorState } from './ui';
export function RecordImage({ id, alt = 'Record photo' }: { id?: string; alt?: string }) {
  useLocale();
  const query = useQuery({
    queryKey: ['image', id],
    enabled: !!id,
    queryFn: () => api<{ url: string }>('/images/' + id),
    staleTime: 60000,
    refetchInterval: 90000,
  });
  if (!id) return null;
  return query.data ? (
    <img className="record-photo" src={query.data.url} alt={t(alt)} loading="lazy" />
  ) : (
    <span className="muted">{query.isError ? t('Photo unavailable') : t('Loading photo…')}</span>
  );
}
export function ImageUpload({
  value,
  onChange,
  purpose,
  label = 'Photo',
  required = false,
  disabled = false,
  onBusy,
}: {
  value?: string;
  onChange: (value: string) => void;
  purpose: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onBusy?: (busy: boolean) => void;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  async function upload(file?: File) {
    if (!file) return;
    setError(undefined);
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(new Error(t('Choose a JPEG, PNG or WebP image up to 5 MiB.')));
      return;
    }
    setBusy(true);
    onBusy?.(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('purpose', purpose);
      if (!['PROJECT', 'USER'].includes(purpose)) body.append('projectId', projectId);
      const result = await api<{ id: string }>('/images', { method: 'POST', body });
      onChange(result.id);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      onBusy?.(false);
    }
  }
  return (
    <div className="image-upload-field">
      <label className="image-upload">
        <ImagePlus size={24} />
        <strong>
          {t(label)}
          {required ? ' *' : ''}
        </strong>
        <span>{busy ? t('Uploading photo…') : t('Choose photo')}</span>
        <input
          type="file"
          aria-label={t(label)}
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || disabled}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>
      <small>{t('JPEG, PNG or WebP. Maximum 5 MiB.')}</small>
      {value && (
        <>
          <RecordImage id={value} alt={label} />
          <Button
            type="button"
            variant="ghost"
            disabled={busy || disabled}
            onClick={() => onChange('')}
          >
            {t('Remove photo')}
          </Button>
        </>
      )}
      {!!error && <ErrorState error={error} />}
    </div>
  );
}
