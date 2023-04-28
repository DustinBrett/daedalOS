const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const HOME = "/Users/Public";
const DESKTOP_PATH = `${HOME}/Desktop`;
const START_MENU_PATH = `${HOME}/Start Menu`;

const ICON_PATH = "/System/Icons";
const SHORTCUT_ICON = `${ICON_PATH}/shortcut.webp`;
const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

const USER_ICON_PATH = `${HOME}/Icons`;
const ICON_CACHE = `${USER_ICON_PATH}/Cache`;
const YT_ICON_CACHE = `${ICON_CACHE}/YouTube`;
const ICON_CACHE_EXTENSION = ".cache";

const VLC_SUBICON = "/System/Icons/16x16/vlc.webp";

const isYouTubeUrl = (url) =>
  url.includes("youtube.com/") || url.includes("youtu.be/");

const getYouTubeUrlId = (url) => {
  try {
    const { pathname, searchParams } = new URL(url);

    return searchParams.get("v") || pathname.split("/").pop() || "";
  } catch {
    // URL parsing failed
  }

  return "";
};

const getPublicDirectoryIcons = (directory) => {
  const isDesktop = directory === DESKTOP_PATH;
  const baseDirectory = join("./public", directory);

  return readdirSync(baseDirectory).reduce((icons, file) => {
    if (extname(file) === ".url") {
      const {
        InternetShortcut: {
          BaseURL: pid = "",
          IconFile: icon = "",
          URL: url = "",
        },
      } = parse(readFileSync(join(baseDirectory, file)).toString());

      if (icon) icons.push(encodeURI(icon));

      if (isDesktop) {
        if (pid === "VideoPlayer") {
          if (!icons.includes(VLC_SUBICON)) icons.push(encodeURI(VLC_SUBICON));
          if (isYouTubeUrl(url)) {
            const iconFileName = `/${getYouTubeUrlId(
              url
            )}${ICON_CACHE_EXTENSION}`;

            if (
              existsSync(join("./public", YT_ICON_CACHE, `${iconFileName}`))
            ) {
              icons.push(encodeURI(`${YT_ICON_CACHE}${iconFileName}`));
            }
          }
        }

        const iconPath = url || `${directory}/${file}`;
        const iconCacheFileName = `${iconPath}${ICON_CACHE_EXTENSION}`;

        if (
          extname(iconPath) &&
          existsSync(join("./public", ICON_CACHE, `${iconCacheFileName}`))
        ) {
          icons.push(encodeURI(`${ICON_CACHE}${iconCacheFileName}`));
        }
      }
    }

    return icons;
  }, []);
};

writeFileSync(
  "./public/.index/desktopIcons.json",
  JSON.stringify([SHORTCUT_ICON, ...getPublicDirectoryIcons(DESKTOP_PATH)])
);

writeFileSync(
  "./public/.index/startMenuIcons.json",
  JSON.stringify([NEW_FOLDER_ICON, ...getPublicDirectoryIcons(START_MENU_PATH)])
);
