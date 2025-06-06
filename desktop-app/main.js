const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
    }
  });

mainWindow.loadURL(`file://${path.join(__dirname, 'dist/luna-dekstop-app/index.html')}`);


mainWindow.webContents.openDevTools();

}

// เรียกเมื่อแอพรันพร้อม
app.whenReady().then(() => {
  createWindow();

  // macOS: เปิดใหม่เมื่อไม่มี window
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ปิดแอปเมื่อทุก window ถูกปิด (ยกเว้น macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// handler เปิด dialog เลือกโฟลเดอร์
ipcMain.handle('open-folder-dialog', async () => {
  console.log('[main] open-folder-dialog called'); // ✅ debug
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});


ipcMain.handle('watch-folder', async (event, folderPath) => {
  console.log('[main] Watching folder:', folderPath);

  fs.watch(folderPath, (eventType, filename) => {
    if (eventType === 'rename' && filename) {
      const filePath = path.join(folderPath, filename);
      if (fs.existsSync(filePath)) {
        event.sender.send('new-file-detected', filePath);
      }
    }
  });
});

ipcMain.handle('read-images-in-folder', async (_, folderPath) => {
  const files = await fs.promises.readdir(folderPath);
  const imageFiles = files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    })
    .map(file => path.join(folderPath, file));

  return imageFiles;
});

ipcMain.handle('read-file-as-base64', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = getMimeType(ext);
    return `data:${mimeType};base64,${data.toString('base64')}`;
  } catch (err) {
    console.error('[main] Failed to read file as base64:', err);
    return null;
  }
});

ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    await fs.promises.unlink(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function getMimeType(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.bmp': return 'image/bmp';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}
