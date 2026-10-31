import { useLayoutEffect, useState } from 'react';
import { usePreferences } from '../stores/preferences';

function resolveTheme(preference: 'light' | 'dark' | 'system') {
  return preference === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : preference;
}

export function applyTheme(preference: 'light' | 'dark' | 'system') {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#0a0a0a' : '#f5f6f8');
  return resolved;
}

export function useTheme() {
  const preference = usePreferences((s) => s.theme);
  const [resolved, setResolved] = useState(() => resolveTheme(preference));
  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setResolved(applyTheme(preference));
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [preference]);
  return resolved;
}
