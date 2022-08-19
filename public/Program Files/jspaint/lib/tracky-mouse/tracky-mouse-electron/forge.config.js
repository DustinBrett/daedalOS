const fs = require("fs");
const path = require("path");
const glob = require("glob");

const logFile = fs.createWriteStream(path.join(__dirname, "forge-hook.log"));
logFile.write("Hello World\n\n");

module.exports = {
	"packagerConfig": {},
	"makers": [
		{
			"name": "@electron-forge/maker-squirrel",
			"config": {
				"name": "tracky_mouse_electron"
			}
		},
		{
			"name": "@electron-forge/maker-zip",
			"platforms": [
				"darwin"
			]
		},
		{
			"name": "@electron-forge/maker-deb",
			"config": {}
		},
		{
			"name": "@electron-forge/maker-rpm",
			"config": {}
		}
	],
	hooks: {
		prePackage: (forgeConfig) => {
			logFile.write("prePackage hook\n\n");
			return new Promise((resolve, reject) => {
				const fromFolder = path.resolve(`${__dirname}/../`);
				const toFolder = `${__dirname}/copied/`;
				const appGlob = `${fromFolder}/**`;
				logFile.write(`appGlob: ${appGlob} \n\n`);
				glob(appGlob, {
					ignore: [
						".*/**",
						"**/tracky-mouse-electron/**",
						"**/node_modules/**",
						"**/private/**",
					]
				}, async (error, files) => {
					logFile.write(`glob callback, files:\n${JSON.stringify(files)}\n\n`);

					logFile.write(`Deleting ${toFolder}\n\n`);
					await fs.promises.rmdir(toFolder, { recursive: true });

					if (error) {
						logFile.write(`Failed to copy app files:\n${error}`);
						reject(error);
						return;
					}
					const copyPromises = [];
					for (const file of files) {
						const newFile = path.join(toFolder, path.relative(fromFolder, file));
						if (!fs.statSync(file).isDirectory()) {
							await fs.promises.mkdir(path.dirname(newFile), { recursive: true });
							logFile.write(`Copy: ${file}\n`);
							logFile.write(`To: ${newFile}\n`);
							copyPromises.push(fs.promises.copyFile(file, newFile));
						}
					}
					await Promise.all(copyPromises);
					resolve();
				});
			});
		}
	}
};
