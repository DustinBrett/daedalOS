const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const HOME = "/Users/Public";
const DESKTOP_PATH = `${HOME}/Desktop`;
const START_MENU_PATH = `${HOME}/Start Menu`;

const ICON_PATH = "/System/Icons";
const SHORTCUT_ICON = `${ICON_PATH}/shortcut.webp`;
const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

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

let desktopIcons = [SHORTCUT_ICON, ...getPublicDirectoryIcons(DESKTOP_PATH)];
let startMenuIcons = [
  NEW_FOLDER_ICON,
  ...getPublicDirectoryIcons(START_MENU_PATH),
];

if (USE_PNG) {
  const replaceWebPWithPng = (icon) => icon.replace(".webp", ".png");

  desktopIcons = desktopIcons.map(replaceWebPWithPng);
  startMenuIcons = startMenuIcons.map(replaceWebPWithPng);
}

writeFileSync(
  "./public/.index/desktopIcons.json",
  JSON.stringify(desktopIcons)
);
writeFileSync(
  "./public/.index/startMenuIcons.json",
  JSON.stringify(startMenuIcons)
);
