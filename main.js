const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const mammoth = require('mammoth');
const PptxGenJS = require('pptxgenjs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src/renderer.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handler for file processing
ipcMain.on('process-file', async (event, filePath) => {
    try {
      let text = '';
      const ext = path.extname(filePath).toLowerCase();
  
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        text = pdfData.text;
  
        // Attempt OCR if PDF text is minimal (likely scanned)
        if (text.length < 50) {
          const { data: { text: ocrText } } = await Tesseract.recognize(filePath, 'eng');
          text = ocrText;
        }
      } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else if (ext === '.pptx') {
        const pptx = new PptxGenJS();
        await pptx.load({ filepath: filePath });
        const slides = pptx.getSlides();
        text = slides.map(slide => slide.text).join('\n');
      } else {
        event.reply('file-error', 'Unsupported file type');
        return;
      }
  
      event.reply('file-processed', text);
    } catch (error) {
      event.reply('file-error', error.message);
    }
  });