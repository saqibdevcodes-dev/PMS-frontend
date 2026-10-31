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
import { applyTheme, useTheme } from './hooks/use-theme';
import '@fontsource-variable/inter';
import './styles/index.css';
import './styles/print.css';
function Root() {
  useLocale();
  const language = usePreferences((s) => s.language);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    const locales = z.locales as Record<string, () => ReturnType<typeof z.locales.en>>;
    z.config((locales[language] ?? z.locales.en)());
  }, [language]);
  const theme = useTheme();
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
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ConfirmDialog />
      <Toaster richColors closeButton theme={theme} position="bottom-right" />
    </QueryClientProvider>
  );
}
applyTheme(usePreferences.getState().theme);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
