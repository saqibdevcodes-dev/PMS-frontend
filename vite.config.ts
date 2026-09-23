import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const proxy = {
  '/api': { target: process.env.PMS_BACKEND_URL || 'http://127.0.0.1:4000', changeOrigin: false },
  '/health': { target: process.env.PMS_BACKEND_URL || 'http://127.0.0.1:4000' },
};
export default defineConfig({
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
});
