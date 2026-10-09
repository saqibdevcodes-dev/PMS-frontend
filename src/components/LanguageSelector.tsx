import { Languages } from 'lucide-react';
import { usePreferences } from '../stores/preferences';
import type { Language } from '../lib/i18n';
export function LanguageSelector({ inline = false }: { inline?: boolean }) {
  const { language, setLanguage } = usePreferences();
  return (
    <div className={'language-selector' + (inline ? ' language-selector-inline' : '')}>
      <Languages size={17} />
      <select
        aria-label="Language / زبان / اللغة"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        <option value="en">English</option>
        <option value="ur">اردو</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
