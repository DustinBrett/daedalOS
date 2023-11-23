const {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
} = require("fs");
const { extname, join } = require("path");
const { parse } = require("ini");

const PUBLIC_DIR = "public";

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

const getPublicDirectoryIcons = (directory) => [
  ...new Set(
    readdirSync(join(PUBLIC_DIR, directory)).reduce((icons, file) => {
      if (extname(file).toLowerCase() === ".url") {
        const {
          InternetShortcut: {
            BaseURL: pid = "",
            IconFile: icon = "",
            URL: url = "",
          },
        } = parse(readFileSync(join(PUBLIC_DIR, directory, file)).toString());
        const isVideo = pid === "VideoPlayer";

        if (isVideo && url) icons.push(encodeURI(VLC_SUBICON));

        if (icon) icons.push(encodeURI(icon));
        else {
          if (isVideo && isYouTubeUrl(url)) {
            const iconFileName = `/${getYouTubeUrlId(
              url
            )}${ICON_CACHE_EXTENSION}`;

            if (
              existsSync(join(PUBLIC_DIR, YT_ICON_CACHE, `${iconFileName}`))
            ) {
              icons.push(encodeURI(`${YT_ICON_CACHE}${iconFileName}`));
            }
          } else {
            const iconPath = url || `${directory}/${file}`;
            const iconCacheFileName = `${iconPath}${ICON_CACHE_EXTENSION}`;

            if (
              extname(iconPath) &&
              existsSync(join(PUBLIC_DIR, ICON_CACHE, `${iconCacheFileName}`))
            ) {
              icons.push(encodeURI(`${ICON_CACHE}${iconCacheFileName}`));
            }
          }
        }
      }

      return icons;
    }, [])
  ),
];

const getIniIcons = () => {
  const iniIcons = {};
  const rootPath = join(PUBLIC_DIR, HOME);
  const readDirectory = (directory) =>
    readdirSync(directory).forEach((entry) => {
      const currentPath = join(directory, entry);

      if (statSync(currentPath).isDirectory()) readDirectory(currentPath);
      else if (entry === "desktop.ini") {
        const {
          ShellClassInfo: { IconFile = "" },
        } = parse(readFileSync(currentPath).toString());

        iniIcons[directory.replace(PUBLIC_DIR, "").replace(/\\/g, "/")] =
          IconFile;
      }
    });

  readDirectory(rootPath);

  return iniIcons;
};

if (!existsSync(join(PUBLIC_DIR, ".index"))) {
  mkdirSync(join(PUBLIC_DIR, ".index"));
}

writeFileSync(
  "./public/.index/desktopIcons.json",
  JSON.stringify([SHORTCUT_ICON, ...getPublicDirectoryIcons(DESKTOP_PATH)])
);

writeFileSync(
  "./public/.index/startMenuIcons.json",
  JSON.stringify([NEW_FOLDER_ICON, ...getPublicDirectoryIcons(START_MENU_PATH)])
);

writeFileSync("./public/.index/iniIcons.json", JSON.stringify(getIniIcons()));
