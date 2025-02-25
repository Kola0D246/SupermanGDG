const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/index.html');
  
  // Uncomment for development tools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });
    
    if (canceled) return null;
    return filePaths[0];
  });
  
  // Handle PDF upload (simplified for MVP)
  ipcMain.handle('upload:pdf', async (event, filePath, assignmentId) => {
    // In a real app, you would send this to your server or store in a database
    // For the MVP, we'll just copy the file to a submissions directory
    
    const submissionsDir = path.join(__dirname, 'submissions');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir);
    }
    
    const fileName = `assignment_${assignmentId}_${path.basename(filePath)}`;
    const targetPath = path.join(submissionsDir, fileName);
    
    // Copy the file
    fs.copyFileSync(filePath, targetPath);
    
    return { success: true, path: targetPath };
  });