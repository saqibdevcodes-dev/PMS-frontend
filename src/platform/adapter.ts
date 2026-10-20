import { Capacitor } from '@capacitor/core';
import { ApiError } from '../lib/errors';
type Tokens = { accessToken: string; refreshToken?: string };
interface DesktopBridge {
  login: (email: string, password: string) => Promise<Tokens>;
  refresh: () => Promise<Tokens>;
  clear: () => Promise<void>;
  print: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  apiBase: string;
  saveFile: (url: string, name: string) => Promise<void>;
  updateStatus: () => Promise<{ status: string; version: string }>;
  checkUpdate: () => Promise<{ status: string; version: string }>;
  installUpdate: () => Promise<void>;
}
declare global {
  interface Window {
    estateDesktop?: DesktopBridge;
  }
}
const desktop = typeof window !== 'undefined' ? window.estateDesktop : undefined;
const mobile = Capacitor.isNativePlatform();
const nativeBase =
  (import.meta.env.VITE_NATIVE_API_URL as string | undefined) || 'http://localhost:4000/api/v1';
const configured = new URL(nativeBase);
if (
  mobile &&
  configured.protocol !== 'https:' &&
  !(
    configured.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(configured.hostname)
  )
)
  throw new Error(
    'Native servers require HTTPS. HTTP is allowed only on localhost for development.',
  );
export function installationId() {
  const existing = localStorage.getItem('estate-installation-id');
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem('estate-installation-id', id);
  return id;
}
export const platform = {
  mobile,
  desktop: Boolean(desktop),
  name: desktop ? 'electron' : mobile ? Capacitor.getPlatform() : 'web',
};
export const apiBase = (
  desktop?.apiBase ?? (mobile ? nativeBase! : import.meta.env.VITE_API_BASE_URL || '/api/v1')
).replace(/\/$/, '');
const nativeRequest = async (path: string, body: unknown): Promise<Tokens> => {
  const response = await fetch(apiBase + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Version': '1.0.0' },
    body: JSON.stringify(body),
    credentials: mobile ? 'omit' : 'include',
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success)
    throw new ApiError(
      response.status,
      data?.error?.code ?? 'AUTH_REQUEST_FAILED',
      data?.error?.message ?? 'Unable to sign in. Please try again.',
      data?.meta?.requestId ?? response.headers.get('X-Request-Id') ?? undefined,
      data?.error?.details,
    );
  return data.data as Tokens;
};
const storage = async () => (await import('@aparajita/capacitor-secure-storage')).SecureStorage;
const saveMobile = async (tokens: Tokens) => {
  if (tokens.refreshToken) await (await storage()).set('estate-refresh', tokens.refreshToken);
  return { accessToken: tokens.accessToken };
};
export const authTransport = {
  native: Boolean(desktop || mobile),
  login: async (email: string, password: string): Promise<Tokens> => {
    if (desktop) return desktop.login(email, password);
    if (mobile)
      return saveMobile(
        await nativeRequest('/auth/native/login', {
          email,
          password,
          platform: Capacitor.getPlatform(),
          deviceId: installationId(),
        }),
      );
    return nativeRequest('/auth/login', { email, password });
  },
  refresh: async (): Promise<Tokens> => {
    if (desktop) return desktop.refresh();
    if (mobile) {
      const refreshToken = await (await storage()).get('estate-refresh');
      if (typeof refreshToken !== 'string') throw new Error('Please sign in.');
      return saveMobile(await nativeRequest('/auth/native/refresh', { refreshToken }));
    }
    return nativeRequest('/auth/refresh', {});
  },
  clear: async () => {
    if (desktop) await desktop.clear();
    if (mobile) await (await storage()).remove('estate-refresh');
  },
};
export async function openExternal(url: string) {
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported link');
  if (desktop) return desktop.openExternal(url);
  if (mobile) {
    const { Browser } = await import('@capacitor/browser');
    return Browser.open({ url });
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
export function print() {
  return desktop ? desktop.print() : window.print();
}
export async function saveFile(url: string, name = 'document.pdf') {
  if (desktop) return desktop.saveFile(url, name);
  if (!mobile) {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported file link.');
    const a = document.createElement('a');
    a.href = parsed.href;
    a.download = name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
    return;
  }
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  const response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error('The download link has expired. Request another download.');
  const blob = await response.blob();
  if (blob.size > 50 * 1024 * 1024)
    throw new Error('The document exceeds the native download limit.');
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(String(reader.result).split(',')[1]!);
    reader.readAsDataURL(blob);
  });
  const file = await Filesystem.writeFile({
    directory: Directory.Cache,
    path: `${crypto.randomUUID()}-${name.replace(/[^\w.-]/g, '_')}`,
    data,
  });
  await Share.share({ title: name, url: file.uri, dialogTitle: 'Save or share document' });
}
export async function captureDocument(): Promise<File> {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
  const photo = await Camera.getPhoto({
    quality: 85,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    correctOrientation: true,
  });
  if (!photo.webPath) throw new Error('No image was captured.');
  const blob = await (await fetch(photo.webPath)).blob();
  return new File([blob], `document-${Date.now()}.jpeg`, { type: 'image/jpeg' });
}
export async function scanCode() {
  if (!mobile) throw new Error('Use a keyboard scanner in the search field on desktop.');
  const { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } =
    await import('@capacitor/barcode-scanner');
  const result = await CapacitorBarcodeScanner.scanBarcode({
    hint: CapacitorBarcodeScannerTypeHint.ALL,
    scanInstructions: 'Scan a property or booking reference',
    scanButton: true,
    scanText: 'Scan reference',
  });
  return result.ScanResult;
}
export async function enablePush(register: (token: string) => Promise<void>) {
  if (!mobile) throw new Error('Native push registration is available in the mobile app.');
  const { PushNotifications } = await import('@capacitor/push-notifications');
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted')
    throw new Error('Notifications were not enabled. You can allow them in device settings.');
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      void cleanup();
      reject(new Error('Push registration timed out. Check the native provider configuration.'));
    }, 30000);
    const listeners = [
      PushNotifications.addListener('registration', (token) => {
        void register(token.value).then(resolve, reject).finally(cleanup);
      }),
      PushNotifications.addListener('registrationError', (error) => {
        reject(new Error(error.error));
        void cleanup();
      }),
    ];
    async function cleanup() {
      clearTimeout(timer);
      for (const listener of listeners) await (await listener).remove();
    }
    void PushNotifications.register().catch((error: unknown) => {
      reject(error);
      void cleanup();
    });
  });
}
export async function connectNative(
  onActive: () => void,
  onOnline: (online: boolean) => void,
  onNotification: () => void,
) {
  if (!mobile) return () => {};
  const [{ App }, { Network }, { SplashScreen }, { PushNotifications }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/network'),
    import('@capacitor/splash-screen'),
    import('@capacitor/push-notifications'),
  ]);
  const handles = await Promise.all([
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) onActive();
    }),
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) history.back();
      else void App.minimizeApp();
    }),
    Network.addListener('networkStatusChange', ({ connected }) => onOnline(connected)),
    PushNotifications.addListener('pushNotificationActionPerformed', onNotification),
  ]);
  onOnline((await Network.getStatus()).connected);
  await SplashScreen.hide();
  return () => {
    for (const handle of handles) void handle.remove();
  };
}
export const desktopUpdates = desktop
  ? { status: desktop.updateStatus, check: desktop.checkUpdate, install: desktop.installUpdate }
  : undefined;
