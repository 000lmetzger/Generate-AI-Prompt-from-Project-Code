const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    listDirectoryContents: (folderPath) => ipcRenderer.invoke('list-directory-contents', folderPath),
    readFileContents: (folderPath) => ipcRenderer.invoke('read-file-contents', folderPath)
});