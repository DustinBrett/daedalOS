const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const HOME = "/Users/Public";
const DESKTOP_PATH = `${HOME}/Desktop`;

const ICON_PATH = "/System/Icons";
const SHORTCUT_ICON = `${ICON_PATH}/shortcut.png`;

const getPublicDirectoryIcons = (directory) => {
  const baseDirectory = join("./public", directory);

  return readdirSync(baseDirectory).reduce((icons, file) => {
    if (extname(file) === ".url") {
      const {
        InternetShortcut: { IconFile: icon = "" },
      } = parse(readFileSync(join(baseDirectory, file)).toString());

      if (icon) icons.push(icon);
    }

    return icons;
  }, []);
};

writeFileSync(
  "./public/.index/preload.json",
  JSON.stringify([...getPublicDirectoryIcons(DESKTOP_PATH), SHORTCUT_ICON])
);
