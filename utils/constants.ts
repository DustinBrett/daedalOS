import type { Size } from "components/system/Window/RndWindow/useResizable";

export const BASE_2D_CONTEXT_OPTIONS: CanvasRenderingContext2DSettings = {
  alpha: false,
  desynchronized: true,
};

export const DEFAULT_LOCALE = "en";

export const DEFAULT_THEME = "defaultTheme";

export const DEFAULT_WINDOW_SIZE: Size = {
  height: 250,
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

export const PREVIEW_FRAME_SECOND = 3;

export const PROCESS_DELIMITER = "__";

export const SAVE_PATH = "/Users/Public/Snaphosts";

export const SHORTCUT_APPEND = " - Shortcut";

export const SHORTCUT_EXTENSION = ".url";

export const SYSTEM_FILES = new Set(["desktop.ini"]);

export const SYSTEM_PATHS = new Set(["/.deletedFiles.log"]);

export const TEMP_PATH = "/Users/Public/Temp";

export const TRANSITIONS_IN_MILLISECONDS = {
  DOUBLE_CLICK: 500,
  START_MENU: 400,
  WINDOW: 250,
};

export const VIDEO_FILE_EXTENSIONS = new Set([
  ".mkv",
  ".mp4",
  ".ogg",
  ".ogm",
  ".ogv",
  ".webm",
]);
