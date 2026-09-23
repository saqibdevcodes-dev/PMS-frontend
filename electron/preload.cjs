const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  'estateDesktop',
  Object.freeze({
    apiBase: 'pms://app/api/v1',
    login: (email, password) => ipcRenderer.invoke('estate:login', email, password),
    refresh: () => ipcRenderer.invoke('estate:refresh'),
    clear: () => ipcRenderer.invoke('estate:clear'),
    print: () => ipcRenderer.invoke('estate:print'),
    openExternal: (url) => ipcRenderer.invoke('estate:open-external', url),
    saveFile: (url, name) => ipcRenderer.invoke('estate:save-file', url, name),
    updateStatus: () => ipcRenderer.invoke('estate:update-status'),
    checkUpdate: () => ipcRenderer.invoke('estate:check-update'),
    installUpdate: () => ipcRenderer.invoke('estate:install-update'),
  }),
);
