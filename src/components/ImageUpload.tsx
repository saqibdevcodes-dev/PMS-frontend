import { t, useLocale } from '../lib/i18n';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ImageOff, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { api } from '../lib/api';
import { usePreferences } from '../stores/preferences';
import { Button, ErrorState } from './ui';
export function RecordImage({
  id,
  alt = 'Record photo',
  fallback,
}: {
  id?: string;
  alt?: string;
  fallback?: ReactNode;
}) {
  useLocale();
  const [failedUrl, setFailedUrl] = useState('');
  const query = useQuery({
    queryKey: ['image', id],
    enabled: !!id,
    queryFn: () => api<{ url: string }>('/images/' + id),
    staleTime: 60000,
    refetchInterval: 90000,
  });
  if (!id) return fallback ?? null;
  return query.data && query.data.url !== failedUrl ? (
    <img
      className="record-photo"
      src={query.data.url}
      alt={t(alt)}
      loading="lazy"
      onError={() => setFailedUrl(query.data!.url)}
    />
  ) : (
    (fallback ?? (
      <span className="photo-placeholder" role="img" aria-label={t('Photo unavailable')}>
        <ImageOff size={22} />
      </span>
    ))
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
  uploadPath = '/images',
  allowRemove = true,
}: {
  value?: string;
  onChange: (value: string) => void;
  purpose: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onBusy?: (busy: boolean) => void;
  uploadPath?: string;
  allowRemove?: boolean;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; size: number; file: File }>();
  const inputId = useId();
  const inFlight = useRef(false);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  async function upload(file?: File) {
    if (!file || disabled || inFlight.current) return;
    setError(undefined);
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(new Error(t('Choose a JPEG, PNG or WebP image up to 5 MiB.')));
      return;
    }
    const candidate = { url: URL.createObjectURL(file), name: file.name, size: file.size, file };
    const previous = preview;
    setPreview(candidate);
    inFlight.current = true;
    setBusy(true);
    onBusy?.(true);
    try {
      const body = new FormData();
      body.append('file', file);
      if (uploadPath === '/images') {
        body.append('purpose', purpose);
        if (!['PROJECT', 'USER'].includes(purpose)) body.append('projectId', projectId);
      }
      const result = await api<{ id: string }>(uploadPath, { method: 'POST', body });
      onChange(result.id);
    } catch (e) {
      // Keep the previously saved image when replacing it fails.
      setPreview(previous ? { ...previous, url: URL.createObjectURL(previous.file) } : undefined);
      setError(e);
    } finally {
      inFlight.current = false;
      setBusy(false);
      onBusy?.(false);
    }
  }
  return (
    <div className="image-upload-field">
      <label className="upload-label" htmlFor={inputId}>
        {t(label)}
        {required ? ' *' : ''}
      </label>
      <label
        className={'image-upload' + (dragging ? ' is-dragging' : '')}
        data-disabled={busy || disabled}
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy && !disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files[0]);
        }}
      >
        <span className="upload-art" aria-hidden="true">
          <ImagePlus size={36} strokeWidth={1.5} />
        </span>
        <span className="upload-prompt">
          {t('Drop your image here, or')} <strong>{t('browse')}</strong>
        </span>
        <small id={inputId + '-help'}>{t('JPEG, PNG or WebP. Maximum 5 MiB.')}</small>
        <input
          id={inputId}
          type="file"
          aria-label={t(label)}
          aria-describedby={inputId + '-help'}
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || disabled}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>
      {(value || busy) && (
        <div className="upload-file" aria-busy={busy}>
          <div className="upload-thumbnail">
            {preview ? (
              <img src={preview.url} alt={t(label)} />
            ) : (
              <RecordImage id={value} alt={label} />
            )}
          </div>
          <div className="upload-file-info">
            <strong title={preview?.name}>{preview?.name ?? t('Current photo')}</strong>
            <small>
              {preview ? `${(preview.size / 1024 / 1024).toFixed(2)} MiB` : t('Saved photo')}
            </small>
          </div>
          <span className="upload-status" role="status">
            {busy ? <LoaderCircle size={18} className="spin" /> : <CheckCircle2 size={18} />}
            <span className="sr-only">{busy ? t('Uploading photo…') : t('Photo uploaded')}</span>
          </span>
          {allowRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('Remove photo')}
              disabled={busy || disabled}
              onClick={() => {
                onChange('');
                setPreview(undefined);
                setError(undefined);
              }}
            >
              <X size={17} />
            </Button>
          )}
          <progress
            aria-label={busy ? t('Uploading photo…') : t('Photo uploaded')}
            max={100}
            value={busy ? undefined : 100}
          />
        </div>
      )}
      {!!error && <ErrorState error={error} />}
    </div>
  );
}
