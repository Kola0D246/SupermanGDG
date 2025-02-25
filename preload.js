const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functionality to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  uploadPDF: (filePath, assignmentId) => ipcRenderer.invoke('upload:pdf', filePath, assignmentId)
});