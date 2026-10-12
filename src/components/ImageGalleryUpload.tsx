import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { t, useLocale } from '../lib/i18n';
import { errorMessage } from '../lib/error-messages';
import { api } from '../lib/api';
import { usePreferences } from '../stores/preferences';
import { RecordImage } from './ImageUpload';
import { Button, ErrorState } from './ui';

const maximum = 5;
type Preview = { url: string; name: string; fingerprint: string };
export function ImageGalleryUpload({
  value = [],
  onChange,
  purpose,
  label,
  disabled,
  onBusy,
}: {
  value?: string[];
  onChange: (value: string[]) => void;
  purpose: string;
  label: string;
  disabled?: boolean;
  onBusy?: (busy: boolean) => void;
}) {
  useLocale();
  const projectId = usePreferences((state) => state.projectId);
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<unknown>();
  const [previews, setPreviews] = useState<Record<string, Preview>>({});
  const [pending, setPending] = useState<Preview>();
  const urls = useRef(new Set<string>());
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const controller = useRef<AbortController | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    const ownedUrls = urls.current;
    return () => {
      mounted.current = false;
      controller.current?.abort();
      for (const url of ownedUrls) URL.revokeObjectURL(url);
      ownedUrls.clear();
    };
  }, []);
  async function upload(files: File[]) {
    if (!files.length || disabled || inFlight.current) return;
    setError(undefined);
    if (value.length + files.length > maximum) {
      setError(new Error(t('Choose up to five photos. Remove a photo before adding more.')));
      return;
    }
    const fingerprints = new Set(
      value.flatMap((id) => (previews[id] ? [previews[id].fingerprint] : [])),
    );
    for (const file of files) {
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        !file.size ||
        file.size > 5 * 1024 * 1024
      ) {
        setError(new Error(`${file.name}: ${t('Choose a JPEG, PNG or WebP image up to 5 MiB.')}`));
        return;
      }
      const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
      if (fingerprints.has(fingerprint)) {
        setError(new Error(`${file.name}: ${t('This photo is already selected.')}`));
        return;
      }
      fingerprints.add(fingerprint);
    }
    inFlight.current = true;
    setBusy(true);
    onBusy?.(true);
    const abort = new AbortController();
    controller.current = abort;
    const next = [...value],
      failures: string[] = [];
    try {
      for (const file of files) {
        if (!mounted.current) break;
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        const preview = {
          url,
          name: file.name,
          fingerprint: `${file.name}:${file.size}:${file.lastModified}`,
        };
        setPending(preview);
        try {
          const body = new FormData();
          body.append('file', file);
          body.append('purpose', purpose);
          if (purpose !== 'PROJECT') body.append('projectId', projectId);
          const result = await api<{ id: string }>('/images', {
            method: 'POST',
            body,
            signal: abort.signal,
          });
          if (!mounted.current) break;
          if (!next.includes(result.id)) next.push(result.id);
          setPreviews((current) => ({ ...current, [result.id]: preview }));
          onChange([...next]);
        } catch (reason) {
          URL.revokeObjectURL(url);
          urls.current.delete(url);
          if (abort.signal.aborted) break;
          failures.push(
            `${file.name}: ${reason instanceof Error ? errorMessage(reason) : t('Upload failed')}`,
          );
        }
      }
      if (mounted.current && failures.length) setError(new Error(failures.join('\n')));
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setBusy(false);
        setPending(undefined);
        onBusy?.(false);
      }
    }
  }
  return (
    <div className="image-upload-field">
      <label className="upload-label" htmlFor={inputId}>
        {t(label)}{' '}
        <span className="muted">
          {value.length} / {maximum}
        </span>
      </label>
      <label
        className={'image-upload gallery-dropzone' + (dragging ? ' is-dragging' : '')}
        data-disabled={busy || disabled || value.length >= maximum}
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy && !disabled && value.length < maximum) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload([...event.dataTransfer.files]);
        }}
      >
        <span className="upload-art" aria-hidden="true">
          <ImagePlus size={36} strokeWidth={1.5} />
        </span>
        <span className="upload-prompt">
          {t('Drop your images here, or')} <strong>{t('browse')}</strong>
        </span>
        <small id={`${inputId}-help`}>
          {t(
            'Up to five photos. JPEG, PNG or WebP. Maximum 5 MiB each. The first photo is the cover.',
          )}
        </small>
        <input
          id={inputId}
          type="file"
          multiple
          aria-label={t(label)}
          aria-describedby={`${inputId}-help`}
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || disabled || value.length >= maximum}
          onChange={(event) => {
            void upload([...(event.target.files ?? [])]);
            event.target.value = '';
          }}
        />
      </label>
      <div className="image-gallery" aria-busy={busy}>
        {value.map((id, index) => (
          <div className="gallery-photo" key={id}>
            <div className="gallery-preview">
              {previews[id] ? (
                <img src={previews[id].url} alt={`${t(label)} ${index + 1}`} />
              ) : (
                <RecordImage id={id} alt={`${t(label)} ${index + 1}`} />
              )}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label={t('Remove photo {0}', { '0': index + 1 })}
                disabled={busy || disabled}
                onClick={() => {
                  onChange(value.filter((imageId) => imageId !== id));
                  setError(undefined);
                  if (previews[id]) {
                    URL.revokeObjectURL(previews[id].url);
                    urls.current.delete(previews[id].url);
                  }
                  setPreviews((current) =>
                    Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)),
                  );
                }}
              >
                <X size={15} />
              </Button>
            </div>
            <div className="gallery-caption">
              <span>{index === 0 ? t('Cover photo') : t('Photo {0}', { '0': index + 1 })}</span>
              {index > 0 && (
                <button
                  type="button"
                  disabled={busy || disabled}
                  onClick={() => onChange([id, ...value.filter((imageId) => imageId !== id)])}
                >
                  {t('Make cover')}
                </button>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="gallery-photo gallery-pending" role="status">
            <div className="gallery-preview">
              <img src={pending.url} alt="" />
              <LoaderCircle className="spin" size={24} />
            </div>
            <span>{t('Uploading photo…')}</span>
          </div>
        )}
      </div>
      {!!error && <ErrorState error={error} />}
    </div>
  );
}
