import type { Size } from "components/system/Window/RndWindow/useResizable";
import type { ClockSource, WallpaperFit } from "contexts/session/types";
import type { AsyncZipOptions } from "fflate";
import type { ThemeName } from "styles/themes";

export const BASE_2D_CONTEXT_OPTIONS: CanvasRenderingContext2DSettings = {
  alpha: false,
  desynchronized: true,
};

export const IFRAME_CONFIG = {
  referrerPolicy: "no-referrer" as React.HTMLAttributeReferrerPolicy,
  sandbox:
    "allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts",
};

export const DEFAULT_LOCALE = "en";

export const DEFAULT_ASCENDING = true;

export const DEFAULT_CLOCK_SOURCE: ClockSource = "local";

export const DEFAULT_THEME: ThemeName = "defaultTheme";

export const DEFAULT_AI_API = "HuggingFace:"; // Engine:Key

export const DEFAULT_NON_WEBGPU_ENGINE = "HuggingFace";

export const DEFAULT_WALLPAPER = "VANTA";

export const DEFAULT_WALLPAPER_FIT: WallpaperFit = "fill";

export const THIN_SCROLLBAR_WIDTH = 13;

export const CLOCK_CANVAS_BASE_WIDTH = 68;

export const SMALLEST_PNG_SIZE = 51;

export const DEFAULT_WINDOW_SIZE: Size = {
  height: 300,
  width: 405,
};

export const DEFAULT_MAPPED_NAME = "Share";

export const FOCUSABLE_ELEMENT = { tabIndex: -1 };

export const DIV_BUTTON_PROPS = {
  as: "div",
  role: "button",
  ...FOCUSABLE_ELEMENT,
};

export const FS_HANDLES = "FileSystemAccessHandles";

export const HOME = "/Users/Public";

export const PICTURES_FOLDER = `${HOME}/Pictures`;

export const INDEX_FILE = "/index.html";

export const PROMPT_FILE = "prompts.json";

export const SLIDESHOW_FILE = "slideshow.json";

export const SLIDESHOW_TIMEOUT_IN_MILLISECONDS = 15000;

export const ICON_GIF_SECONDS = 2;

export const ICON_GIF_FPS = 24;

export const PEEK_MAX_WIDTH = 200;

export const LIST_VIEW_ANIMATION = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const TIFF_IMAGE_FORMATS = new Set([
  ".cr2",
  ".dng",
  ".nef",
  ".tif",
  ".tiff",
]);

export const CLIPBOARD_FILE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png"]);

export const IMAGE_FILE_EXTENSIONS = new Set([
  ...TIFF_IMAGE_FORMATS,
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
  ".jxl",
  ".pjp",
  ".pjpeg",
  ".png",
  ".svg",
  ".qoi",
  ".webp",
  ".xbm",
]);

export const UNSUPPORTED_BACKGROUND_EXTENSIONS = new Set([
  ...TIFF_IMAGE_FORMATS,
  ".jxl",
  ".qoi",
  ".svg",
]);

export const TEXT_EDITORS = ["MonacoEditor", "Vim"];

export const CURSOR_FILE_EXTENSIONS = new Set([".ani", ".cur"]);

export const EDITABLE_IMAGE_FILE_EXTENSIONS = new Set([
  ".bmp",
  ".gif",
  ".ico",
  ".jfif",
  ".jpe",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

export const PHOTO_ICON = "/System/Icons/photo.webp";

export const MAX_FILE_NAME_LENGTH = 223;

export const MENU_SEPERATOR = { seperator: true };

export const MILLISECONDS_IN_SECOND = 1000;

export const MILLISECONDS_IN_MINUTE = 60000;

export const MILLISECONDS_IN_DAY = 86400000;

export const MOUNTABLE_EXTENSIONS = new Set([".iso", ".jsdos", ".wsz", ".zip"]);

export const SPREADSHEET_FORMATS = [
  ".csv",
  ".numbers",
  ".ods",
  ".xls",
  ".xlsx",
];

export const MP3_MIME_TYPE = "audio/mpeg";

export const VIDEO_FALLBACK_MIME_TYPE = "video/mp4";

export const NON_BREAKING_HYPHEN = "\u2011";

export const ONE_TIME_PASSIVE_EVENT = {
  once: true,
  passive: true,
} as AddEventListenerOptions;

export const PREVENT_SCROLL = { preventScroll: true };

export const PROCESS_DELIMITER = "__";

export const SAVE_PATH = `${HOME}/Snapshots`;

export const PICUTRES_PATH = `${HOME}/Pictures`;

export const SHORTCUT_APPEND = " - Shortcut";

export const SHORTCUT_EXTENSION = ".url";

export const SYSTEM_FILES = new Set(["desktop.ini"]);

export const SYSTEM_PATHS = new Set(["/.deletedFiles.log"]);

export const DESKTOP_PATH = `${HOME}/Desktop`;

export const SYSTEM_SHORTCUT_DIRECTORIES = new Set([DESKTOP_PATH]);

export const TRANSITIONS_IN_MILLISECONDS = {
  DOUBLE_CLICK: 500,
  LONG_PRESS: 500,
  MOUSE_IN_OUT: 300,
  TASKBAR_ITEM: 400,
  WINDOW: 250,
};

export const TRANSITIONS_IN_SECONDS = {
  TASKBAR_ITEM:
    TRANSITIONS_IN_MILLISECONDS.TASKBAR_ITEM / MILLISECONDS_IN_SECOND,
  WINDOW: TRANSITIONS_IN_MILLISECONDS.WINDOW / MILLISECONDS_IN_SECOND,
};

export const LONG_PRESS_DELAY_MS = 750;

export const ONE_DAY_IN_MILLISECONDS = 86400000;

export const AUDIO_FILE_EXTENSIONS = new Set([".aac", ".oga", ".wav"]);

export const AUDIO_PLAYLIST_EXTENSIONS = new Set([".asx", ".m3u", ".pls"]);

export const VIDEO_FILE_EXTENSIONS = new Set([
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".ogg",
  ".ogm",
  ".ogv",
  ".webm",
]);

export const DYNAMIC_PREFIX = ["nostr:"];

export const DYNAMIC_EXTENSION = new Set([
  ...AUDIO_FILE_EXTENSIONS,
  ...AUDIO_PLAYLIST_EXTENSIONS,
  ...IMAGE_FILE_EXTENSIONS,
  ...TIFF_IMAGE_FORMATS,
  ...VIDEO_FILE_EXTENSIONS,
  ".ani",
  ".exe",
  ".mp3",
  ".sav",
  ".whtml",
]);

export const SAVE_TITLE_CHAR = "\u25CF";

export const ROOT_NAME = "My PC";

export const ROOT_SHORTCUT = `${ROOT_NAME}.url`;

export const ICON_PATH = "/System/Icons";

export const USER_ICON_PATH = `${HOME}/Icons`;

export const ICON_CACHE = `${USER_ICON_PATH}/Cache`;

export const YT_ICON_CACHE = `${ICON_CACHE}/YouTube`;

export const ICON_CACHE_EXTENSION = ".cache";

export const SESSION_FILE = "/session.json";

export const SHORTCUT_ICON = `${ICON_PATH}/shortcut.webp`;

export const FAVICON_BASE_PATH = "/favicon.ico";

export const FOLDER_ICON = `${ICON_PATH}/folder.webp`;

export const FOLDER_BACK_ICON = `${ICON_PATH}/folder_back.webp`;

export const FOLDER_FRONT_ICON = `${ICON_PATH}/folder_front.webp`;

export const COMPRESSED_FOLDER_ICON = `${ICON_PATH}/compressed.webp`;

export const MOUNTED_FOLDER_ICON = `${ICON_PATH}/mounted.webp`;

export const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

export const SMALLEST_JXL_FILE =
  "data:image/jxl;base64,/woIAAAMABKIAgC4AF3lEgAAFSqjjBu8nOv58kOHxbSN6wxttW1hSaLIODZJJ3BIEkkaoCUzGM6qJAE=";

export const UNKNOWN_ICON_PATH = `${ICON_PATH}/unknown.webp`;

export const TIMESTAMP_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  year: "numeric",
};

export const MAX_RES_ICON_OVERRIDE: Record<string, [number, number]> = {
  desktop: [16, 32],
  document: [16, 32],
  folder: [16, 16],
  mounted: [16, 16],
  music: [16, 32],
  pc: [16, 16],
  pictures: [16, 32],
  user: [16, 16],
  videos: [16, 32],
};

export const MAX_ICON_SIZE = 144;

export const DEFAULT_TEXT_FILE_SAVE_PATH = `${DESKTOP_PATH}/Untitled.txt`;

export const DEFAULT_SCROLLBAR_WIDTH = 17;

export const TASKBAR_HEIGHT = 30;

export const PACKAGE_DATA = {
  alias: "daedalOS",
  author: {
    email: "dustinbrett@gmail.com",
    name: "Dustin Brett",
    npub: "npub10uc7hg6wdxhhd7ee8x9c5lr9d0ux7272rv2m0mc03ds54q7quxjss02r3p",
    url: "https://dustinbrett.com",
  },
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
