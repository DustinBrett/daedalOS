const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const HOME = "/Users/Public";
const DESKTOP_PATH = `${HOME}/Desktop`;

const ICON_PATH = "/System/Icons";
const SHORTCUT_ICON = `${ICON_PATH}/shortcut.webp`;

const USE_PNG = false;

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

let preloadIcons = [...getPublicDirectoryIcons(DESKTOP_PATH), SHORTCUT_ICON];

if (USE_PNG) {
  preloadIcons = preloadIcons.map((icon) => icon.replace(".webp", ".png"));
}

writeFileSync("./public/.index/preload.json", JSON.stringify(preloadIcons));
