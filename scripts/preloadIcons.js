const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const HOME = "/Users/Public";
const START_MENU_PATH = `${HOME}/Start Menu`;

const ICON_PATH = "/System/Icons";
const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

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
  "./public/.index/startMenuIcons.json",
  JSON.stringify([NEW_FOLDER_ICON, ...getPublicDirectoryIcons(START_MENU_PATH)])
);
