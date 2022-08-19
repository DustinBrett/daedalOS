const { app, shell, session, dialog, ipcMain, BrowserWindow } = require('electron');
const fs = require("fs");
const path = require("path");

app.enableSandbox();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}

// Reloading and dev tools shortcuts
const { isPackaged } = app;
const isDev = process.env.ELECTRON_DEBUG === "1" || !isPackaged;
if (isDev) {
	require('electron-debug')({ showDevTools: false });
}

// @TODO: let user apply this setting somewhere in the UI (togglable)
// (Note: it would be better to use REG.EXE to apply the change, rather than a .reg file)
// This registry modification changes the right click > Edit option for images in Windows Explorer
const reg_contents = `Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\\SystemFileAssociations\\image\\shell\\edit\\command]
@="\\"${process.argv[0].replace(/\\/g, "\\\\")}\\" ${isPackaged ? "" : '\\".\\" '}\\"%1\\""
`; // oof that's a lot of escaping \\
////                                \\\\
//  /\   /\   /\   /\   /\   /\   /\  \\
// //\\ //\\ //\\ //\\ //\\ //\\ //\\ \\
//  ||   ||   ||   ||   ||   ||   ||  \\
//\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\
const reg_file_path = path.join(
	isPackaged ? path.dirname(process.argv[0]) : ".",
	`set-jspaint${isPackaged ? "" : "-DEV-MODE"}-as-default-image-editor.reg`
);
if (process.platform == "win32" && isPackaged) {
	fs.writeFile(reg_file_path, reg_contents, (err) => {
		if (err) {
			return console.error(err);
		}
	});
}

// In case of XSS holes, don't give the page free reign over the filesystem!
// Only allow allow access to files explicitly opened by the user.
const allowed_file_paths = [];

let initial_file_path;
if (process.argv.length >= 2) {
	// in production, "path/to/jspaint.exe" "maybe/a/file.png"
	// in development, "path/to/electron.exe" "." "maybe/a/file.png"
	const initial_file_path = process.argv[isPackaged ? 1 : 2];
	allowed_file_paths.push(initial_file_path);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// @TODO: It's been several electron versions. I doubt this is still necessary. (It was from a boilerplate.)
let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		useContentSize: true,
		autoHideMenuBar: true, // it adds height for a native menu bar unless we hide it here
		// setMenu(null) below is too late; it's already decided on the size by then
		width: 800,
		height: 600,
		minWidth: 260,
		minHeight: 360,
		icon: path.join(__dirname, "../images/icons",
			process.platform === "win32" ?
				"jspaint.ico" :
				process.platform === "darwin" ?
					"jspaint.icns" :
					"48x48.png"
		),
		title: "JS Paint",
		webPreferences: {
			preload: path.join(__dirname, "/electron-injected.js"),
			contextIsolation: false,
		},
	});

	// @TODO: maybe use the native menu for the "Modern" theme, or a "Native" theme
	mainWindow.setMenu(null);

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/../index.html`);

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	// Emitted before the window is closed.
	mainWindow.on('close', (event) => {
		// Don't need to check mainWindow.isDocumentEdited(),
		// because the (un)edited state is handled by the renderer process, in are_you_sure().
		// Note: if the web contents are not responding, this will make the app harder to close.
		// Similarly, if there's an error, the app will be harder to close (perhaps worse as it's less likely to show a Not Responding dialog).
		// And this also prevents it from closing with Ctrl+C in the terminal, which is arguably a feature.
		mainWindow.webContents.send('close-window-prompt');
		event.preventDefault();
	});

	// Open links without target=_blank externally.
	mainWindow.webContents.on('will-navigate', (e, url) => {
		// check that the URL is not part of the app
		if (!url.includes("file://")) {
			e.preventDefault();
			shell.openExternal(url);
		}
	});
	// Open links with target=_blank externally.
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		// check that the URL is not part of the app
		if (!url.includes("file://")) {
			shell.openExternal(url);
		}
		return { action: "deny" };
	});

	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				// connect-src needs data: for loading from localStorage,
				// and maybe blob: for loading from IndexedDB in the future.
				// (It uses fetch().)
				// Note: this should mirror the CSP in index.html, except maybe for firebase stuff.
				"Content-Security-Policy": [`
					default-src 'self';
					style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
					img-src 'self' data: blob: http: https:;
					font-src 'self' https://fonts.gstatic.com;
					connect-src * data: blob:;
				`],
			}
		})
	});

	ipcMain.on("get-env-info", (event) => {
		event.returnValue = {
			isDev,
			isMacOS: process.platform === "darwin",
			initialFilePath: initial_file_path,
		};
	});
	ipcMain.on("set-represented-filename", (event, filePath) => {
		if (allowed_file_paths.includes(filePath)) {
			mainWindow.setRepresentedFilename(filePath);
		}
	});
	ipcMain.on("set-document-edited", (event, isEdited) => {
		mainWindow.setDocumentEdited(isEdited);
	});
	ipcMain.handle("show-save-dialog", async (event, options) => {
		const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
			title: options.title,
			// defaultPath: options.defaultPath,
			defaultPath: options.defaultPath || path.basename(options.defaultFileName),
			filters: options.filters,
		});
		const fileName = path.basename(filePath);
		allowed_file_paths.push(filePath);
		return { filePath, fileName, canceled };
	});
	ipcMain.handle("show-open-dialog", async (event, options) => {
		const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
			title: options.title,
			defaultPath: options.defaultPath,
			filters: options.filters,
			properties: options.properties,
		});
		allowed_file_paths.push(...filePaths);
		return { filePaths, canceled };
	});
	ipcMain.handle("write-file", async (event, file_path, data) => {
		if (!allowed_file_paths.includes(file_path)) {
			return { responseCode: "ACCESS_DENIED" };
		}
		// make sure data is an ArrayBuffer, so you can't use an options object for (unknown) evil reasons
		if (data instanceof ArrayBuffer) {
			try {
				await fs.promises.writeFile(file_path, Buffer.from(data));
			} catch (error) {
				return { responseCode: "WRITE_FAILED", error };
			}
			return { responseCode: "SUCCESS" };
		} else {
			return { responseCode: "INVALID_DATA" };
		}
	});
	ipcMain.handle("read-file", async (event, file_path) => {
		if (!allowed_file_paths.includes(file_path)) {
			return { responseCode: "ACCESS_DENIED" };
		}
		try {
			const buffer = await fs.promises.readFile(file_path);
			return { responseCode: "SUCCESS", data: new Uint8Array(buffer), fileName: path.basename(file_path) };
		} catch (error) {
			return { responseCode: "READ_FAILED", error };
		}
	});
	ipcMain.handle("set-wallpaper", async (event, data) => {
		const image_path = path.join(app.getPath("userData"), "bg.png"); // Note: used without escaping
		if (!(data instanceof ArrayBuffer)) {
			return { responseCode: "INVALID_DATA" };
		}
		data = new Uint8Array(data);
		const png_magic_bytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
		for (let i = 0; i < png_magic_bytes.length; i++) {
			if (data[i] !== png_magic_bytes[i]) {
				console.log("Found bytes:", data.slice(0, png_magic_bytes.length), "but expected:", png_magic_bytes);
				return { responseCode: "INVALID_PNG_DATA" };
			}
		}
		try {
			await fs.promises.writeFile(image_path, Buffer.from(data));
		} catch (error) {
			return { responseCode: "WRITE_TEMP_PNG_FAILED", error };
		}

		// The wallpaper module actually has support for Xfce, but it's not general enough.
		const bash_for_xfce = `xfconf-query -c xfce4-desktop -l | grep last-image | while read path; do xfconf-query -c xfce4-desktop -p $path -s '${image_path}'; done`;
		const { lookpath } = require("lookpath");
		if (await lookpath("xfconf-query") && await lookpath("grep")) {
			const exec = require("util").promisify(require('child_process').exec);
			try {
				await exec(bash_for_xfce);
			} catch (error) {
				console.error("Error setting wallpaper for Xfce:", error);
				return { responseCode: "XFCONF_FAILED", error };
			}
			return { responseCode: "SUCCESS" };
		} else {
			// Note: { scale: "center" } is only supported on macOS.
			// I worked around this by providing an image with a transparent margin on other platforms,
			// in setWallpaperCentered.
			return new Promise((resolve, reject) => {
				require("wallpaper").set(image_path, { scale: "center" }, error => {
					if (error) {
						resolve({ responseCode: "SET_WALLPAPER_FAILED", error });
					} else {
						resolve({ responseCode: "SUCCESS" });
					}
				});
			});
			// Newer promise-based wallpaper API that I can't import:
			// try {
			// 	await setWallpaper(image_path, { scale: "center" });
			// } catch (error) {
			// 	return { responseCode: "SET_WALLPAPER_FAILED", error };
			// }
			// return { responseCode: "SUCCESS" };
		}
	});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
