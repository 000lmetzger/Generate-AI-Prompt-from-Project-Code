const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const pathModule = require('path');
const fs = require('node:fs').promises;

ipcMain.handle('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    console.log("hello");
    return result;
});

ipcMain.handle('read-file-contents', async (event, folderPath) => {
    try {
        const files = await fs.readdir(folderPath);
        const fileContents = {};
        for (const file of files) {
            const filePath = pathModule.join(folderPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    fileContents[file] = content;
                } catch (readError) {
                    console.error(`Fehler beim Lesen der Datei ${file}:`, readError);
                    fileContents[file] = `Konnte Datei nicht lesen: ${readError.message}`;
                }
            }
        }
        return fileContents;
    } catch (err) {
        console.error('Fehler beim Lesen des Verzeichnisses:', err);
        return { error: err.message };
    }
});

ipcMain.handle('list-directory-contents', async (event, folderPath) => {
    try {
        const items = await fs.readdir(folderPath);
        return items;
    } catch (err) {
        console.error('Fehler beim Auflisten des Verzeichnisses:', err);
        return { error: err.message };
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 450,
        minHeight: 450,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: pathModule.join(__dirname, 'preload.js'),
            csp: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'`
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});