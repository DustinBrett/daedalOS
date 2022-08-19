// Electron-specific code injected into the renderer process
// to provide integrations, for the desktop app

// I've enabled sandboxing, so the fs module is not available.
// Operations must be carried out in the main process.

const { /*contextBridge,*/ ipcRenderer } = require('electron');

const { isDev, isMacOS, initialFilePath } = ipcRenderer.sendSync("get-env-info");

// contextBridge.exposeInMainWorld("is_electron_app", true);
// contextBridge.exposeInMainWorld("electron_is_dev", isDev);
// contextBridge.exposeInMainWorld("initial_system_file_handle", initialFilePath);

// contextBridge.exposeInMainWorld("electron_app", {

window.is_electron_app = true;
window.electron_is_dev = isDev;
window.initial_system_file_handle = initialFilePath;

ipcRenderer.on("close-window-prompt", () => {
	are_you_sure(() => {
		window.close();
	});
});

window.setRepresentedFilename = (filePath) => {
	ipcRenderer.send("set-represented-filename", filePath);
};
window.setDocumentEdited = (documentEdited) => {
	ipcRenderer.send("set-document-edited", documentEdited);
};

function show_save_error_message(responseCode, error) {
	if (responseCode === "ACCESS_DENIED") {
		return show_error_message(localize("Access denied."));
	}
	if (responseCode === "INVALID_DATA") {
		return show_error_message("Failed to save: Invalid data. This shouldn't happen!");
	}
	if (responseCode !== "SUCCESS") {
		return show_error_message(localize("Failed to save document."), error);
	}
	// return show_save_error_message(localize("No error occurred."));
}
async function write_blob_to_file_path(filePath, blob) {
	const arrayBuffer = await blob.arrayBuffer();
	const { responseCode, error } = await ipcRenderer.invoke("write-file", filePath, arrayBuffer);
	return { responseCode, error };
}

window.systemHooks = window.systemHooks || {};
window.systemHooks.showSaveFileDialog = async ({ formats, defaultFileName, defaultPath, defaultFileFormatID, getBlob, savedCallbackUnreliable }) => {

	// First filter in filters list determines default selected file type.
	// @TODO: default to existing extension, except it would be awkward to rearrange the list...
	// const suggestedExtension = get_file_extension(defaultFileName);

	// We can't get the selected file type, so show only a set of formats
	// that can be accessed uniquely by their file extensions
	formats = formats_unique_per_file_extension(formats);

	const filters = formats.map(({ name, extensions }) => ({ name, extensions }));

	// @TODO: should defaultFileName/defaultPath be sanitized in some way?
	let filePath, fileName, canceled;
	try {
		// This is not the Electron API directly, but it's similar
		// fileName stuff is added so I don't need to do equivalent to path.basename() in the renderer
		({ filePath, fileName, canceled } = await ipcRenderer.invoke("show-save-dialog", {
			title: localize("Save As"),
			// defaultPath: defaultPath || path.basename(defaultFileName),
			defaultFileName,
			defaultPath,
			filters,
		}));
	} catch (error) {
		show_error_message(localize("Failed to save document."), error);
	}
	if (canceled) {
		return;
	}

	const extension = (filePath.indexOf(".") > -1) && filePath.split(/\./g).pop().toLowerCase();
	if (!extension) {
		// @TODO: Linux/Unix?? you're not supposed to need file extensions
		// should it use defaultFileFormatID?
		return show_error_message("Missing file extension - Try adding .png to the end of the file name");
	}
	const format = get_format_from_extension(formats, filePath);
	if (!format) {
		return show_error_message(`Can't save as *.${extension} - Try adding .png to the end of the file name`);
	}
	const blob = await getBlob(format.mimeType);
	const { responseCode, error } = await write_blob_to_file_path(filePath, blob);
	if (responseCode !== "SUCCESS") {
		return show_save_error_message(responseCode, error);
	}
	savedCallbackUnreliable && savedCallbackUnreliable({
		// newFileName: path.basename(filePath),
		newFileName: fileName,
		newFileFormatID: format.mimeType,
		newFileHandle: filePath,
		newBlob: blob,
	});
};
window.systemHooks.showOpenFileDialog = async ({ formats, defaultPath }) => {
	// @TODO: use categories for filters
	// ideally this function should be generic to formats, so shouldn't do it here:
	// const filters = image_format_categories(formats).map(({ name, extensions }) => ({ name, extensions }));
	const filters = formats.map(({ name, extensions }) => ({ name, extensions }));
	const { canceled, filePaths } = await ipcRenderer.invoke("show-open-dialog", {
		title: localize("Open"),
		filters,
		defaultPath,
	});
	if (canceled) {
		throw new Error("user canceled");
	}
	const filePath = filePaths[0];
	const file = await window.systemHooks.readBlobFromHandle(filePath);
	return { file, fileHandle: filePath };
};

window.systemHooks.writeBlobToHandle = async (filePath, blob) => {
	if (typeof filePath !== "string") {
		return show_error_message("writeBlobToHandle in Electron expects a file path");
		// should it fall back to default writeBlobToHandle?
	}
	const { responseCode, error } = await write_blob_to_file_path(filePath, blob);
	if (responseCode !== "SUCCESS") {
		return show_save_error_message(responseCode, error);
	}
};
window.systemHooks.readBlobFromHandle = async (filePath) => {
	if (typeof filePath !== "string") {
		return show_error_message("readBlobFromHandle in Electron expects a file path");
		// should it fall back to default readBlobFromHandle?
	}
	const { responseCode, error, data, fileName } = await ipcRenderer.invoke("read-file", filePath);
	if (responseCode === "ACCESS_DENIED") {
		return show_error_message(localize("Access denied."));
	}
	if (responseCode !== "SUCCESS") {
		return show_error_message(localize("Paint cannot open this file."), error);
	}
	const file = new File([new Uint8Array(data)], fileName);
	// can't set file.path directly, but we can do this:
	Object.defineProperty(file, 'path', {
		value: filePath,
	});

	return file;
};

window.systemHooks.setWallpaperCentered = (canvas) => {
	// @TODO: implement centered option for Windows and Linux in https://www.npmjs.com/package/wallpaper
	// currently it's only supported on macOS
	let wallpaperCanvas;
	if (isMacOS) {
		wallpaperCanvas = canvas;
	} else {
		wallpaperCanvas = make_canvas(screen.width, screen.height);
		const x = (screen.width - canvas.width) / 2;
		const y = (screen.height - canvas.height) / 2;
		wallpaperCanvas.ctx.drawImage(canvas, ~~x, ~~y);
	}

	wallpaperCanvas.toBlob(blob => {
		sanity_check_blob(blob, () => {
			blob.arrayBuffer().then((arrayBuffer) => {
				ipcRenderer.invoke("set-wallpaper", arrayBuffer).then(({ responseCode, error }) => {
					if (responseCode === "WRITE_TEMP_PNG_FAILED") {
						return show_error_message("Failed to set wallpaper: Couldn't write temporary image file.", error);
					}
					if (responseCode === "INVALID_DATA") {
						return show_error_message(`Failed to set wallpaper. Invalid data in IPC.`, error);
					}
					if (responseCode === "INVALID_PNG_DATA") {
						return show_error_message(`Failed to set wallpaper.\n\n${localize("Unexpected file format.")}`, error);
					}
					if (responseCode === "XFCONF_FAILED") {
						return show_error_message("Failed to set wallpaper (for Xfce).", error);
					}
					if (responseCode !== "SUCCESS") {
						return show_error_message("Failed to set wallpaper.", error);
					}
				}).catch(error => {
					show_error_message("Failed to set wallpaper.", error);
				});
			}, (error) => {
				show_error_message("Failed to set wallpaper: Couldn't read blob as array buffer.", error);
			});
		});
	});
};
