const { app, globalShortcut, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Needed for RobotJS native module in renderer process (could be moved to main with IPC)
app.allowRendererProcessReuse = false;

// Allow recovering from WebGL crash unlimited times.
// (To test the recovery, I've been using Ctrl+Alt+F1 and Ctrl+Alt+F2 in Ubuntu.
// Note, if Ctrl + Alt + F2 doesn't get you back, try Ctrl+Alt+F7.)
app.commandLine.appendSwitch("--disable-gpu-process-crash-limit");


const trackyMouseFolder = app.isPackaged ? `${app.getAppPath()}/copied/` : `${__dirname}/../../`;

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/preload.js'),
    },
    // icon: `${trackyMouseFolder}/images/tracky-mouse-logo-16.png`,
    icon: `${trackyMouseFolder}/images/tracky-mouse-logo-512.png`,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(`${trackyMouseFolder}/index.html`);

  // Toggle the DevTools with F12
  mainWindow.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F12") {
      mainWindow.webContents.toggleDevTools();

      mainWindow.webContents.on('devtools-opened', () => {
        // Can't use mainWindow.webContents.devToolsWebContents.on("before-input-event") - it just doesn't intercept any events.
        mainWindow.webContents.devToolsWebContents.executeJavaScript(`
            new Promise((resolve)=> {
              addEventListener("keydown", (event) => {
                if (event.key === "F12") {
                  resolve();
                }
              }, { once: true });
            })
          `)
          .then(() => {
            mainWindow.webContents.toggleDevTools();
          });
      });
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  
  const success = globalShortcut.register('F9', () => {
    // console.log('Toggle tracking');
    mainWindow.webContents.send("shortcut", "toggle-tracking");
  });

});

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
