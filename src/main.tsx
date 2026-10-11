import { useLocale } from './lib/i18n';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './app/App';
import { ConfirmDialog } from './components/ConfirmDialog';
import { z } from 'zod';
import { connectNative } from './platform/adapter';
import { queryClient } from './lib/query';
import { usePreferences } from './stores/preferences';
import '@fontsource-variable/inter';
import './styles/index.css';
function Root() {
  useLocale();
  const language = usePreferences((s) => s.language);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    const locales = z.locales as Record<string, () => ReturnType<typeof z.locales.en>>;
    z.config((locales[language] ?? z.locales.en)());
  }, [language]);
  const theme = usePreferences((s) => s.theme);
  useEffect(() => {
    const cleanup = connectNative(
      () => {
        void queryClient.invalidateQueries();
      },
      (online) => onlineManager.setOnline(online),
      () => {
        window.location.hash = '/notifications';
      },
    );
    return () => {
      void cleanup.then((dispose) => dispose());
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ConfirmDialog />
      <Toaster richColors closeButton theme={theme} position="bottom-right" />
    </QueryClientProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
