import type { Size } from "components/system/Window/RndWindow/useResizable";
import type { AsyncZipOptions } from "fflate";

export const BASE_2D_CONTEXT_OPTIONS: CanvasRenderingContext2DSettings = {
  alpha: false,
  desynchronized: true,
};

export const DEFAULT_LOCALE = "en";

export const DEFAULT_THEME = "defaultTheme";

export const THIN_SCROLLBAR_WIDTH = 13;

export const DEFAULT_WINDOW_SIZE: Size = {
  height: 300,
  width: 405,
};

export const FOCUSABLE_ELEMENT = { tabIndex: -1 };

export const FS_HANDLES = "FileSystemAccessHandles";

export const HOME = "/Users/Public";

export const IMAGE_FILE_EXTENSIONS = new Set([
  ".apng",
  ".avif",
  ".bmp",
  ".cur",
  ".gif",
  ".ico",
  ".jfif",
  ".jif",
  ".jpe",
  ".jpeg",
  ".jpg",
  ".pjp",
  ".pjpeg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
  ".xbm",
]);

export const INVALID_FILE_CHARACTERS = /["*/:<>?\\|]/g;

export const MAX_FILE_NAME_LENGTH = 223;

export const MENU_SEPERATOR = { seperator: true };

export const MILLISECONDS_IN_SECOND = 1000;

export const EXTRACTABLE_EXTENSIONS = new Set([
  ".7z",
  ".gz",
  ".jsdos",
  ".rar",
  ".tar",
  ".wsz",
  ".zip",
]);

export const MOUNTABLE_EXTENSIONS = new Set([".iso", ".jsdos", ".wsz", ".zip"]);

export const MP3_MIME_TYPE = "audio/mpeg";

export const NON_BREAKING_HYPHEN = "\u2011";

export const ONE_TIME_PASSIVE_EVENT = {
  once: true,
  passive: true,
} as AddEventListenerOptions;

export const PREVENT_SCROLL = { preventScroll: true };

export const PREVIEW_FRAME_SECOND = 3;

export const PROCESS_DELIMITER = "__";

export const SAVE_PATH = `${HOME}/Snapshots`;

export const SHORTCUT_APPEND = " - Shortcut";

export const SHORTCUT_EXTENSION = ".url";

export const SYSTEM_FILES = new Set(["desktop.ini"]);

export const SYSTEM_PATHS = new Set(["/.deletedFiles.log"]);

export const DESKTOP_PATH = `${HOME}/Desktop`;

export const TRANSITIONS_IN_MILLISECONDS = {
  DOUBLE_CLICK: 500,
  LONG_PRESS: 500,
  START_MENU: 450,
  WINDOW: 250,
};

export const ONE_DAY_IN_MILLISECONDS = 86400000;

export const VIDEO_FILE_EXTENSIONS = new Set([
  ".mkv",
  ".mp4",
  ".ogg",
  ".ogm",
  ".ogv",
  ".webm",
]);

export const ROOT_NAME = "My PC";

export const ROOT_SHORTCUT = `${ROOT_NAME}.url`;

export const ICON_PATH = "/System/Icons";

export const USER_ICON_PATH = `${HOME}/Icons`;

export const ICON_CACHE = `${USER_ICON_PATH}/Cache`;

export const SHORTCUT_ICON = `${ICON_PATH}/shortcut.webp`;

export const FOLDER_ICON = `${ICON_PATH}/folder.webp`;

export const FOLDER_BACK_ICON = `${ICON_PATH}/folder_back.webp`;

export const FOLDER_FRONT_ICON = `${ICON_PATH}/folder_front.webp`;

export const MOUNTED_FOLDER_ICON = `${ICON_PATH}/mounted.webp`;

export const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

export const UNKNOWN_ICON =
  // `${ICON_PATH}/unknown.png`
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB0ElEQVR42u2ZVWLbQBiEp/K6DOpb+LF4ip47oCuULpAYH3uAlcbMNOZpm0lsizWz+/3CgEc9aiuFHz9/YYVIcjAAkODcYYDoTyPQHZse7m0E49tLkid/8rz4BuD7RgFIYpW+fvmMXStJEvz+/RuvXr1KG41mVhT5RiECRMUYsUuF0Nv18+fPcXp6ktbrjSzPhRBCDxxUpVKpG+Ls7DSt1eprhwjYWwAdJQD9EGftELV2iCiHCAQMAvT04sVznJ+fpdVqNcuj1hOBJj0wCvECFxcXaeWhIuEUYFADAGZCXF5dpg/3DxmA99YIZVmGRXr58lVqi1CMER8+fOh+pkUS5XIZd7d3ylEIViI5M7wCITqa1wOAtDVPKD1A45andC1ES/N6DZCuzKsIWZr3RoikMK4jZGleD2BsntDOA74tT0gIOZrXEfJmXiti24KleBi1M09SThBIU/P6mZiW5qEXMW3NUzuMGrc8NYRssSE0hFyZVxFyLVgdIcOW51oIWZqHfj9ga15+rOLb8lIRg47m9RoQ/R+eeb0GaGleR8i15XWEqL5VFIIJ87V5u70nvrm+AUF0/8nx4ZlxgOj+9KeTk+Oz8/rrYnIYBAoWeNSj9qwWS/T9vUU9j2EAAAAASUVORK5CYII=";

export const DEFAULT_SCROLLBAR_WIDTH = 17;

export const TASKBAR_HEIGHT = 30;

export const PACKAGE_DATA = {
  alias: "daedalOS",
  author: "Dustin Brett",
  description: "Desktop environment in the browser",
  license: "MIT",
  version: "2.0.0",
};

export const BASE_ZIP_CONFIG: AsyncZipOptions = {
  consume: true,
  level: 0,
  mem: 8,
};
