const {
  app,
  BrowserWindow,
  protocol,
  net,
  ipcMain,
  safeStorage,
  shell,
  dialog,
  Menu,
  session,
} = require('electron');
const { readFile, writeFile, rename, rm, stat } = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { randomUUID } = require('node:crypto');
const { serverUrl, externalUrl, assetPath } = require('./security.cjs');
const smokeTest = !app.isPackaged && process.env.PMS_DESKTOP_SMOKE === '1';
if (smokeTest) app.setPath('userData', path.resolve(__dirname, '../test-results/electron-profile'));
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'pms',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
]);
if (!app.requestSingleInstanceLock()) app.quit();
let mainWindow, apiBase, refreshFile, installationId, flight;
let update = { status: 'unconfigured', version: app.getVersion() };
let updater;
const csp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'";
async function authRequest(endpoint, body) {
  const response = await net.fetch(apiBase + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Version': app.getVersion() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    if (response.status === 401) await rm(refreshFile, { force: true });
    throw new Error(result.error?.message || 'Authentication failed.');
  }
  if (!safeStorage.isEncryptionAvailable())
    throw new Error('Operating-system secure storage is unavailable.');
  const next = refreshFile + '.new';
  await writeFile(next, safeStorage.encryptString(result.data.refreshToken), { mode: 0o600 });
  await rename(next, refreshFile);
  return { accessToken: result.data.accessToken };
}
function handle(name, callback) {
  ipcMain.handle('estate:' + name, (event, ...args) => {
    if (
      event.sender !== mainWindow?.webContents ||
      event.senderFrame !== mainWindow.webContents.mainFrame ||
      (new URL(event.senderFrame.url).origin !== 'null' &&
        !event.senderFrame.url.startsWith('pms://app/'))
    )
      throw new Error('Untrusted IPC sender.');
    if (!event.senderFrame.url.startsWith('pms://app/')) throw new Error('Untrusted IPC origin.');
    return callback(...args);
  });
}
async function installProtocol() {
  const root = path.join(__dirname, '..', 'dist');
  protocol.handle('pms', async (request) => {
    try {
      const url = new URL(request.url);
      if (url.hostname !== 'app') return new Response('Not found', { status: 404 });
      if (url.pathname.startsWith('/api/v1/')) {
        const endpoint = url.pathname.slice('/api/v1'.length);
        if (/^\/auth\/(native\/|login$|refresh$)/.test(endpoint))
          return new Response('Use the native auth bridge', { status: 403 });
        if (!['GET', 'POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method))
          return new Response('Method not allowed', { status: 405 });
        const headers = new Headers();
        for (const key of [
          'authorization',
          'content-type',
          'idempotency-key',
          'x-request-id',
          'x-client-version',
        ]) {
          const value = request.headers.get(key);
          if (value) headers.set(key, value);
        }
        const upstream = await net.fetch(apiBase + endpoint + url.search, {
          method: request.method,
          headers,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
          redirect: 'error',
          signal: AbortSignal.timeout(30000),
        });
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            'Content-Type': upstream.headers.get('content-type') || 'application/json',
            'Cache-Control': 'no-store',
          },
        });
      }
      let file = assetPath(root, url.pathname === '/' ? '/index.html' : url.pathname);
      try {
        if (!(await stat(file)).isFile()) return new Response('Not found', { status: 404 });
      } catch {
        return new Response('Not found', { status: 404 });
      }
      const response = await net.fetch(pathToFileURL(file).href);
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', csp);
      return new Response(response.body, { status: 200, headers });
    } catch {
      return new Response('Request failed', { status: 502 });
    }
  });
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 390,
    minHeight: 650,
    title: 'etihadrealestate.com',
    backgroundColor: '#f5f7fb',
    show: false,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      devTools: !app.isPackaged,
    },
  });
  mainWindow.once('ready-to-show', () => {
    if (!smokeTest) mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('pms://app/')) event.preventDefault();
  });
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault());
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
  void mainWindow.loadURL('pms://app/index.html');
}
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
app
  .whenReady()
  .then(async () => {
    let config = {};
    try {
      config = JSON.parse(
        await readFile(path.join(app.getPath('userData'), 'server.json'), 'utf8'),
      );
    } catch {
      /* Optional public server configuration. */
    }
    apiBase = serverUrl(
      process.env.PMS_DESKTOP_API_URL || config.apiUrl || 'http://127.0.0.1:4000/api/v1',
    );
    refreshFile = path.join(app.getPath('userData'), 'session.encrypted');
    const installationFile = path.join(app.getPath('userData'), 'installation-id');
    try {
      installationId = await readFile(installationFile, 'utf8');
    } catch {
      installationId = randomUUID();
      await writeFile(installationFile, installationId);
    }
    await installProtocol();
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) =>
      callback(false),
    );
    session.defaultSession.setPermissionCheckHandler(() => false);
    handle('login', (email, password) => {
      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        email.length > 320 ||
        password.length > 128
      )
        throw new Error('Invalid login.');
      return authRequest('/auth/native/login', {
        email,
        password,
        platform: 'electron',
        deviceId: installationId,
      });
    });
    handle('refresh', () => {
      flight ??= (async () => {
        if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure storage unavailable.');
        const refreshToken = safeStorage.decryptString(await readFile(refreshFile));
        return authRequest('/auth/native/refresh', { refreshToken });
      })().finally(() => {
        flight = undefined;
      });
      return flight;
    });
    handle('clear', () => rm(refreshFile, { force: true }));
    handle(
      'print',
      () =>
        new Promise((resolve, reject) =>
          mainWindow.webContents.print({ silent: false, printBackground: true }, (ok, reason) =>
            ok || reason === 'cancelled' ? resolve() : reject(new Error(reason)),
          ),
        ),
    );
    handle('open-external', (url) => shell.openExternal(externalUrl(url)));
    handle('save-file', async (url, name) => {
      const checked = externalUrl(url);
      const filename = Array.from(path.basename(String(name || 'document')))
        .map((c) => (c.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(c) ? '_' : c))
        .join('');
      const destination = await dialog.showSaveDialog(mainWindow, { defaultPath: filename });
      if (destination.canceled || !destination.filePath) return;
      const response = await net.fetch(checked, {
        redirect: 'error',
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) throw new Error('Download failed. Request a fresh download link.');
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 50 * 1024 * 1024)
        throw new Error('This file exceeds the desktop download limit.');
      await writeFile(destination.filePath, Buffer.from(bytes));
    });
    const feed = process.env.PMS_UPDATE_URL || config.updateUrl;
    if (feed && new URL(feed).protocol === 'https:' && app.isPackaged) {
      updater = require('electron-updater').autoUpdater;
      updater.autoDownload = false;
      updater.autoInstallOnAppQuit = false;
      updater.setFeedURL({ provider: 'generic', url: feed });
      update.status = 'idle';
      for (const [event, status] of [
        ['checking-for-update', 'checking'],
        ['update-available', 'available'],
        ['update-not-available', 'current'],
        ['update-downloaded', 'ready'],
      ])
        updater.on(event, (info) => {
          update = { status, version: info?.version || app.getVersion() };
        });
      updater.on('error', () => {
        update.status = 'error';
      });
    }
    handle('update-status', () => update);
    handle('check-update', async () => {
      if (!updater) return update;
      if (update.status === 'available') {
        update.status = 'downloading';
        await updater.downloadUpdate();
      } else await updater.checkForUpdates();
      return update;
    });
    handle('install-update', () => {
      if (update.status === 'ready') updater.quitAndInstall();
    });
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'etihadrealestate.com',
          submenu: [
            {
              label: 'Print current view',
              accelerator: 'CmdOrCtrl+P',
              click: () => mainWindow?.webContents.print({ silent: false, printBackground: true }),
            },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
        { role: 'editMenu' },
        { role: 'viewMenu' },
      ]),
    );
    createWindow();
  })
  .catch((error) => {
    dialog.showErrorBox('etihadrealestate.com could not start', error.message);
    app.quit();
  });
app.on('window-all-closed', () => app.quit());
