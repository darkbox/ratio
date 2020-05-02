const { app, BrowserWindow } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 748,
        minWidth: 800,
        minHeight: 600,
        title: "Ratio",
        icon: __dirname + '/src/assets/icon_256.png',
        webPreferences: {
            preload: __dirname + '/src/preload.js'
        }
    })

    win.removeMenu()
    win.loadFile('src/app.html')

    // Open the DevTools.
    //win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
