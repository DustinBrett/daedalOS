import type { Size } from "components/system/Window/RndWindow/useResizable";

export const DEFAULT_FILE_VIEWER = "MonacoEditor";

export const DEFAULT_LOCALE = "en";

export const DEFAULT_THEME = "defaultTheme";

export const DEFAULT_WINDOW_SIZE: Size = {
  height: 200,
  width: 250,
};

export const EMPTY_BUFFER = Buffer.from("");

export const FOCUSABLE_ELEMENT = { tabIndex: -1 };

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

export const MENU_SEPERATOR = { seperator: true };

export const MILLISECONDS_IN_SECOND = 1000;

export const MOUNTABLE_EXTENSIONS = new Set([".iso", ".jsdos", ".wsz", ".zip"]);

export const MP3_MIME_TYPE = "audio/mpeg";

export const ONE_TIME_PASSIVE_EVENT = {
  once: true,
  passive: true,
} as AddEventListenerOptions;

export const PREVENT_SCROLL = { preventScroll: true };

export const PROCESS_DELIMITER = "__";

export const SAVE_PATH = "/saves";

export const SHORTCUT_EXTENSION = ".url";

export const SYSTEM_FILES = new Set(["/.deletedFiles.log"]);

export const TRANSITIONS_IN_MILLISECONDS = {
  DOUBLE_CLICK: 500,
  START_MENU: 400,
  WINDOW: 250,
};
