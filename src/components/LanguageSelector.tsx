import { Languages } from 'lucide-react';
import { usePreferences } from '../stores/preferences';
import type { Language } from '../lib/i18n';
import { Select } from './Select';
export function LanguageSelector() {
  const { language, setLanguage } = usePreferences();
  return (
    <div className="language-selector">
      <Languages size={17} />
      <Select
        aria-label="Language / زبان / اللغة"
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ur', label: 'اردو' },
          { value: 'ar', label: 'العربية' },
        ]}
      />
    </div>
  );
}
