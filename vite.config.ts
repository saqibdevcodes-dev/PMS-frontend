import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'PMS_');
  const target = env.PMS_BACKEND_URL?.trim().replace(/\/$/, '');
  if (command === 'serve' && !target)
    throw new Error(`Set PMS_BACKEND_URL in .env.${mode}. No local backend fallback is enabled.`);
  const proxy = target
    ? {
        '/api': { target, changeOrigin: true },
        '/health': { target, changeOrigin: true },
      }
    : undefined;
  return {
    plugins: [react(), tailwindcss()],
    // Web deep links and both native custom-scheme origins serve assets from the root.
    base: '/',
    server: {
      proxy,
      watch: {
        ignored: [
          '**/release/**',
          '**/android/**',
          '**/ios/**',
          '**/test-results/**',
          '**/playwright-report/**',
        ],
      },
    },
    preview: { proxy },
    build: { sourcemap: false },
  };
});
