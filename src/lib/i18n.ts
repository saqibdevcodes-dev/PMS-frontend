import { usePreferences } from '../stores/preferences';
import messages from './translations.json';
export type Language = 'en' | 'ur' | 'ar';
const dictionary = messages as Record<string, string[]>;
const folded = Object.fromEntries(
  Object.entries(dictionary).map(([key, value]) => [key.toLowerCase(), value]),
);
export function useLocale() {
  return usePreferences((s) => s.language);
}
export function t(message: string | undefined, values: Record<string, unknown> = {}) {
  message ??= '';
  const language = usePreferences.getState().language;
  const key = message.replace(/\s+/g, ' ').trim();
  const translated =
    language === 'en'
      ? message
      : ((dictionary[key] ?? folded[key.toLowerCase()])?.[language === 'ur' ? 0 : 1] ?? message);
  return translated.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}
export const localeCode = () =>
  ({ en: 'en-GB', ur: 'ur-PK', ar: 'ar' })[usePreferences.getState().language];
