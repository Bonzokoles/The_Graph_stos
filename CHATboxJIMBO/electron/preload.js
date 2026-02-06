const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Backend management
    getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),
    restartBackend: () => ipcRenderer.invoke('restart-backend'),

    // Listeners
    onBackendStatus: (callback) => {
        ipcRenderer.on('backend-status', (event, status) => callback(status));
    },

    // App info
    platform: process.platform,
    isElectron: true,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

console.log('✅ Preload script loaded - electronAPI exposed');
