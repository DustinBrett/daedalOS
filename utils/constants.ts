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

export const ICON_GIF_SECONDS = 2;

export const ICON_GIF_FPS = 24;

export const IMAGE_FILE_EXTENSIONS = new Set([
  ".ani",
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
  ".svg",
  ".webp",
  ".xbm",
]);

export const INVALID_FILE_CHARACTERS = /["*/:<>?\\|]/g;

export const MAX_FILE_NAME_LENGTH = 223;

export const MENU_SEPERATOR = { seperator: true };

export const MILLISECONDS_IN_SECOND = 1000;

export const MILLISECONDS_IN_DAY = 86400000;

export const EXTRACTABLE_EXTENSIONS = new Set([
  ".001",
  ".7z",
  ".ace",
  ".apk",
  ".appx",
  ".arj",
  ".bz2",
  ".bzip2",
  ".cab",
  ".chm",
  ".chw",
  ".cpio",
  ".deb",
  ".dll",
  ".dmg",
  ".doc",
  ".docx",
  ".epub",
  ".esd",
  ".exe",
  ".flv",
  ".gz",
  ".gzip",
  ".hfs",
  ".hxs",
  ".img",
  ".ipa",
  ".jar",
  ".lha",
  ".lit",
  ".lzh",
  ".lzma",
  ".mbr",
  ".msi",
  ".ntfs",
  ".ods",
  ".odt",
  ".ova",
  ".pkg",
  ".ppt",
  ".qcow",
  ".qcow2",
  ".r00",
  ".rar",
  ".rpm",
  ".squashfs",
  ".swf",
  ".swm",
  ".sys",
  ".tar",
  ".taz",
  ".tgz",
  ".txz",
  ".udf",
  ".vdi",
  ".vhd",
  ".vhdx",
  ".vmdk",
  ".wim",
  ".xar",
  ".xip",
  ".xls",
  ".xlsx",
  ".xpi",
  ".xz",
  ".z",
  ".zipx",
]);

export const MOUNTABLE_EXTENSIONS = new Set([".iso", ".jsdos", ".wsz", ".zip"]);

export const MP3_MIME_TYPE = "audio/mpeg";

export const NON_BREAKING_HYPHEN = "\u2011";

export const ONE_TIME_PASSIVE_EVENT = {
  once: true,
  passive: true,
} as AddEventListenerOptions;

export const PREVENT_SCROLL = { preventScroll: true };

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

export const AUDIO_FILE_EXTENSIONS = new Set([".oga", ".wav"]);

export const VIDEO_FILE_EXTENSIONS = new Set([
  ".m4v",
  ".mkv",
  ".mp4",
  ".ogg",
  ".ogm",
  ".ogv",
  ".webm",
]);

export const MEDIA_FILE_EXTENSIONS = new Set([
  ...AUDIO_FILE_EXTENSIONS,
  ...VIDEO_FILE_EXTENSIONS,
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

export const COMPRESSED_FOLDER_ICON = `${ICON_PATH}/compressed.webp`;

export const MOUNTED_FOLDER_ICON = `${ICON_PATH}/mounted.webp`;

export const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

export const UNKNOWN_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB0ElEQVR42u2ZVWLbQBiEp/K6DOpb+LF4ip47oCuULpAYH3uAlcbMNOZpm0lsizWz+/3CgEc9aiuFHz9/YYVIcjAAkODcYYDoTyPQHZse7m0E49tLkid/8rz4BuD7RgFIYpW+fvmMXStJEvz+/RuvXr1KG41mVhT5RiECRMUYsUuF0Nv18+fPcXp6ktbrjSzPhRBCDxxUpVKpG+Ls7DSt1eprhwjYWwAdJQD9EGftELV2iCiHCAQMAvT04sVznJ+fpdVqNcuj1hOBJj0wCvECFxcXaeWhIuEUYFADAGZCXF5dpg/3DxmA99YIZVmGRXr58lVqi1CMER8+fOh+pkUS5XIZd7d3ylEIViI5M7wCITqa1wOAtDVPKD1A45andC1ES/N6DZCuzKsIWZr3RoikMK4jZGleD2BsntDOA74tT0gIOZrXEfJmXiti24KleBi1M09SThBIU/P6mZiW5qEXMW3NUzuMGrc8NYRssSE0hFyZVxFyLVgdIcOW51oIWZqHfj9ga15+rOLb8lIRg47m9RoQ/R+eeb0GaGleR8i15XWEqL5VFIIJ87V5u70nvrm+AUF0/8nx4ZlxgOj+9KeTk+Oz8/rrYnIYBAoWeNSj9qwWS/T9vUU9j2EAAAAASUVORK5CYII=";

export const UNKNOWN_ICON_PATH = `${ICON_PATH}/unknown.png`;

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

export const HIGH_PRIORITY_REQUEST = { priority: "high" } as RequestInit;

export const HIGH_PRIORITY_ELEMENT = {
  fetchpriority: "high",
} as React.HTMLAttributes<HTMLElement>;
