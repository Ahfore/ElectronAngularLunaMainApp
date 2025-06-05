const { contextBridge, ipcRenderer } = require('electron');

console.log('[preload] loaded ✅');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  watchFolder: (folderPath) => ipcRenderer.invoke('watch-folder', folderPath),
  onNewFileDetected: (callback) => {
    ipcRenderer.on('new-file-detected', (event, filePath) => {
      callback(filePath);
    });
  },
  readImagesInFolder: (folderPath) => ipcRenderer.invoke('read-images-in-folder', folderPath)
});
