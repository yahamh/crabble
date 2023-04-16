const { app, BrowserWindow, globalShortcut, ipcMain, ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;
let childWindow;
let isChatDocked = true;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: (3 * 1920) / 4,
        height: (3 * 1080) / 4,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadURL(`file://${path.join(__dirname, '/dist/client/index.html')}`);

    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function createChildWindow() {
    childWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        modal: false,
        show: false,
        parent: mainWindow,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    childWindow.loadURL(`file://${path.join(__dirname, '/dist/client/index.html#chat')}`);

    childWindow.setMenuBarVisibility(false);

    childWindow.once('ready-to-show', () => {
        childWindow.show();
    });

    childWindow.on('closed', function () {
        isChatDocked = !isChatDocked
        mainWindow.webContents.send('toggleChat', isChatDocked);
        childWindow = null;
    });
}

function manageChildWindowChatToggle() {
    if (!isChatDocked) {
        childWindow.close();
    } else {
        isChatDocked = !isChatDocked
        mainWindow.webContents.send('toggleChat', isChatDocked);
        createChildWindow();
    }
}

ipcMain.on('openChildWindow', (event, arg) => {
    createChildWindow();
});

ipcMain.on('toggleChat', (event, args) => {
    manageChildWindowChatToggle();
})

app.whenReady().then(() => {
    globalShortcut.register('F11', () => {
        mainWindow.fullScreen = !mainWindow.fullScreen;
    });
}).then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
