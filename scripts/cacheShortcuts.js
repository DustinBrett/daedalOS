const { readdirSync, readFileSync, writeFileSync, statSync } = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const PUBLIC_DIR = "public";
const SHORTCUT_EXTENSION = ".url";

const getAllShortcuts = (rootPath) => {
  const shortcutData = {};
  const readDirectory = (directory) =>
    readdirSync(directory).forEach((entry) => {
      const currentPath = join(directory, entry);

      if (statSync(currentPath).isDirectory()) readDirectory(currentPath);
      else if (extname(entry).toLowerCase() === SHORTCUT_EXTENSION) {
        const dirName = directory.replace(PUBLIC_DIR, "").replace(/\\/g, "/");

        if (!shortcutData[dirName]) shortcutData[dirName] = {};

        const { InternetShortcut } =
          parse(readFileSync(currentPath).toString()) || {};

        if (InternetShortcut) shortcutData[dirName][entry] = InternetShortcut;
      }
    });

  readDirectory(rootPath);

  return shortcutData;
};

writeFileSync(
  "./public/.index/shortcutCache.json",
  JSON.stringify(getAllShortcuts(PUBLIC_DIR))
);
