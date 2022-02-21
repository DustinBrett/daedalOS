import type { Size } from "components/system/Window/RndWindow/useResizable";

export const BASE_2D_CONTEXT_OPTIONS: CanvasRenderingContext2DSettings = {
  alpha: false,
  desynchronized: true,
};

export const DEFAULT_LOCALE = "en";

export const DEFAULT_THEME = "defaultTheme";

export const DEFAULT_WINDOW_SIZE: Size = {
  height: 300,
  width: 388,
};

export const EMPTY_BUFFER = Buffer.from("");

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

export const MOUNTABLE_EXTENSIONS = new Set([
  ".iso",
  ".jsdos",
  ".rar",
  ".wsz",
  ".zip",
]);

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

export const ICON_PATH = "/System/Icons";

export const USER_ICON_PATH = "/Users/Public/Icons";

export const ICON_CACHE = `${USER_ICON_PATH}/Cache`;

export const SHORTCUT_ICON = `${ICON_PATH}/shortcut.png`;

export const FOLDER_ICON = `${ICON_PATH}/folder.png`;

export const MOUNTED_FOLDER_ICON = `${ICON_PATH}/mounted.png`;

export const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.png`;

export const UNKNOWN_ICON = `${ICON_PATH}/unknown.png`;

export const DEFAULT_SCROLLBAR_WIDTH = 17;

export const TASKBAR_HEIGHT = 30;
