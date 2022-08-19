const { moveMouse } = require('robotjs');
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("moveMouse", (...args) => moveMouse(...args));

contextBridge.exposeInMainWorld("onShortcut", (callback) => {
	ipcRenderer.on("shortcut", (event, data) => {
		// console.log("shortcut", data);
		callback(data);
	});
});
