import { t, useLocale } from '../lib/i18n';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { featureOptions } from '../lib/form-guidance';
import type { Row } from '../lib/types';
import { Button } from './ui';
import { ImageUpload } from './ImageUpload';
export function FeatureEditor({
  name,
  disabled,
  onBusy,
}: {
  name: string;
  disabled?: boolean;
  onBusy: (key: string, busy: boolean) => void;
}) {
  useLocale();
  const form = useFormContext<Row>();
  const features = (form.watch(name) as string[] | undefined) ?? [];
  const images =
    (form.watch('featureImages') as { feature: string; imageId: string }[] | undefined) ?? [];
  const [choice, setChoice] = useState('');
  const [other, setOther] = useState('');
  const candidate = choice === 'OTHER' ? other.trim() : choice;
  function updateImages(feature: string, id: string) {
    form.setValue(
      'featureImages',
      [...images.filter((i) => i.feature !== feature), ...(id ? [{ feature, imageId: id }] : [])],
      { shouldDirty: true },
    );
  }
  return (
    <fieldset className="form-section">
      <legend>{t('Property features')}</legend>
      <p className="muted">{t('Choose each feature and optionally add its photo.')}</p>
      <div className="feature-picker">
        <select
          aria-label={t('Choose a feature')}
          value={choice}
          disabled={disabled}
          onChange={(e) => setChoice(e.target.value)}
        >
          <option value="">{t('Choose a feature')}</option>
          {featureOptions.map((f) => (
            <option key={f} value={f}>
              {t(f)}
            </option>
          ))}
          <option value="OTHER">{t('Other')}</option>
        </select>
        {choice === 'OTHER' && (
          <input
            aria-label={t('Other feature')}
            placeholder={t('e.g. Rooftop garden')}
            value={other}
            maxLength={100}
            onChange={(e) => setOther(e.target.value)}
            disabled={disabled}
          />
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || !candidate || features.includes(candidate) || features.length >= 30}
          onClick={() => {
            form.setValue(name, [...features, candidate], { shouldDirty: true });
            setChoice('');
            setOther('');
          }}
        >
          {t('Add feature')}
        </Button>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <div className="feature-card" key={feature}>
            <strong>{t(feature)}</strong>
            <ImageUpload
              label={t('Feature photo')}
              purpose="FEATURE"
              value={images.find((i) => i.feature === feature)?.imageId}
              onChange={(id) => updateImages(feature, id)}
              disabled={disabled}
              onBusy={(busy) => onBusy(feature, busy)}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                form.setValue(
                  name,
                  features.filter((f) => f !== feature),
                  { shouldDirty: true },
                );
                updateImages(feature, '');
              }}
            >
              {t('Remove feature')}
            </Button>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
