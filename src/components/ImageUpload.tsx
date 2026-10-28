import { t, useLocale } from '../lib/i18n';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, CheckCircle2, ImageOff, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { api } from '../lib/api';
import { usePreferences } from '../stores/preferences';
import { ErrorState } from './ui';

export function RecordImage({
  id,
  alt = 'Record photo',
  fallback,
  className = 'record-photo',
  loading = 'lazy',
}: {
  id?: string;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
  loading?: 'lazy' | 'eager';
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
  if (query.isLoading) {
    return (
      <span
        className={`photo-placeholder photo-loading ${className}`}
        role="status"
        aria-label={t('Loading photo…')}
      >
        <LoaderCircle size={20} className="spin" />
      </span>
    );
  }
  return query.data && query.data.url !== failedUrl ? (
    <img
      className={className}
      src={query.data.url}
      alt={t(alt)}
      loading={loading}
      onError={() => setFailedUrl(query.data!.url)}
    />
  ) : (
    (fallback ?? (
      <span
        className={`photo-placeholder ${className}`}
        role="img"
        aria-label={t('Photo unavailable')}
      >
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
  aspectRatio,
  minHeight,
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
  aspectRatio?: string;
  minHeight?: number | string;
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
      !(
        purpose === 'PROJECT_LOGO'
          ? ['image/jpeg', 'image/png']
          : ['image/jpeg', 'image/png', 'image/webp']
      ).includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        new Error(
          purpose === 'PROJECT_LOGO'
            ? t('Choose a PNG or JPEG logo up to 5 MiB.')
            : t('Choose a JPEG, PNG or WebP image up to 5 MiB.'),
        ),
      );
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
        if (!['PROJECT', 'PROJECT_LOGO', 'USER'].includes(purpose))
          body.append('projectId', projectId);
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

  const hasImage = Boolean(preview?.url || value);

  return (
    <div className="image-upload-field">
      {label && (
        <label className="upload-label" htmlFor={inputId}>
          {t(label)}
          {required ? ' *' : ''}
        </label>
      )}
      <label
        className={
          'image-upload' + (hasImage ? ' has-image' : '') + (dragging ? ' is-dragging' : '')
        }
        data-disabled={busy || disabled}
        style={{
          ...(aspectRatio ? { aspectRatio } : {}),
          ...(minHeight !== undefined ? { minHeight } : {}),
        }}
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
        {hasImage ? (
          <div className="image-upload-preview-container">
            {preview ? (
              <img src={preview.url} alt={t(label)} className="image-upload-preview-img" />
            ) : (
              <RecordImage id={value} alt={label} className="image-upload-preview-img" />
            )}
            <div className="image-upload-overlay" aria-hidden="true">
              <Camera size={22} />
              <span>{t('Change photo')}</span>
            </div>
            {allowRemove && !busy && !disabled && (
              <button
                type="button"
                className="image-upload-remove-btn"
                title={t('Remove photo')}
                aria-label={t('Remove photo')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('');
                  setPreview(undefined);
                  setError(undefined);
                }}
              >
                <X size={15} />
              </button>
            )}
            {busy && (
              <div className="image-upload-busy-overlay">
                <LoaderCircle size={26} className="spin" />
                <span>{t('Uploading photo…')}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <span className="upload-art" aria-hidden="true">
              <ImagePlus size={36} strokeWidth={1.5} />
            </span>
            <span className="upload-prompt">
              {t('Drop your image here, or')} <strong>{t('browse')}</strong>
            </span>
            <small id={inputId + '-help'}>
              {purpose === 'PROJECT_LOGO'
                ? t('PNG or JPEG. Maximum 5 MiB. Use a logo suitable for a white page.')
                : t('JPEG, PNG or WebP. Maximum 5 MiB.')}
            </small>
          </>
        )}
        <input
          id={inputId}
          type="file"
          aria-label={t(label)}
          aria-describedby={inputId + '-help'}
          accept={
            purpose === 'PROJECT_LOGO' ? 'image/jpeg,image/png' : 'image/jpeg,image/png,image/webp'
          }
          disabled={busy || disabled}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>

      {(hasImage || busy) && (
        <div className="image-upload-meta">
          <span className="image-upload-status" role="status">
            {busy ? (
              <>
                <LoaderCircle size={14} className="spin" />
                <span>{t('Uploading photo…')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="upload-success-icon" />
                <span className="image-upload-name" title={preview?.name ?? t('Photo uploaded')}>
                  {preview?.name ?? t('Photo uploaded')}
                </span>
              </>
            )}
          </span>
          {preview?.size ? (
            <span className="image-upload-size">{(preview.size / 1024 / 1024).toFixed(2)} MiB</span>
          ) : null}
        </div>
      )}

      {!!error && <ErrorState error={error} />}
    </div>
  );
}
