import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.estate.pms',
  appName: 'Estate PMS',
  webDir: 'dist',
  server: { androidScheme: 'https', iosScheme: 'capacitor' },
  android: { allowMixedContent: false },
  plugins: {
    CapacitorHttp: { enabled: true },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 700,
      backgroundColor: '#101c34',
      showSpinner: false,
    },
    StatusBar: { style: 'LIGHT', backgroundColor: '#101c34' },
    Keyboard: { resize: 'body' },
  },
};
export default config;
