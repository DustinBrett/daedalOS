"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAVE_PATH = exports.PROCESS_DELIMITER = exports.PREVENT_SCROLL = exports.ONE_TIME_PASSIVE_EVENT = exports.NON_BREAKING_HYPHEN = exports.VIDEO_FALLBACK_MIME_TYPE = exports.MP3_MIME_TYPE = exports.SPREADSHEET_FORMATS = exports.MOUNTABLE_EXTENSIONS = exports.MILLISECONDS_IN_DAY = exports.MILLISECONDS_IN_MINUTE = exports.MILLISECONDS_IN_SECOND = exports.MENU_SEPERATOR = exports.EDITABLE_IMAGE_FILE_EXTENSIONS = exports.SUMMARIZABLE_FILE_EXTENSIONS = exports.CURSOR_FILE_EXTENSIONS = exports.TEXT_EDITORS = exports.UNSUPPORTED_SLIDESHOW_EXTENSIONS = exports.IMAGE_FILE_EXTENSIONS = exports.CLIPBOARD_FILE_EXTENSIONS = exports.TIFF_IMAGE_FORMATS = exports.HEIF_IMAGE_FORMATS = exports.LIST_VIEW_ANIMATION = exports.PEEK_MAX_WIDTH = exports.ICON_GIF_FPS = exports.ICON_GIF_SECONDS = exports.SLIDESHOW_TIMEOUT_IN_MILLISECONDS = exports.SLIDESHOW_FILE = exports.PROMPT_FILE = exports.INDEX_FILE = exports.VIDEOS_FOLDER = exports.PICTURES_FOLDER = exports.HOME = exports.FS_HANDLES = exports.DIV_BUTTON_PROPS = exports.FOCUSABLE_ELEMENT = exports.DEFAULT_MAPPED_NAME = exports.DEFAULT_WINDOW_SIZE = exports.SMALLEST_PNG_SIZE = exports.CLOCK_CANVAS_BASE_WIDTH = exports.THIN_SCROLLBAR_WIDTH_NON_WEBKIT = exports.THIN_SCROLLBAR_WIDTH = exports.DEFAULT_WALLPAPER_FIT = exports.DEFAULT_WALLPAPER = exports.DEFAULT_THEME = exports.DEFAULT_CLOCK_SOURCE = exports.DEFAULT_ASCENDING = exports.DEFAULT_LOCALE = exports.IFRAME_CONFIG = exports.BASE_2D_CONTEXT_OPTIONS = void 0;
exports.BASE_ZIP_CONFIG = exports.PACKAGE_DATA = exports.TASKBAR_HEIGHT = exports.DEFAULT_SCROLLBAR_WIDTH = exports.DEFAULT_TEXT_FILE_SAVE_PATH = exports.MAX_ICON_SIZE = exports.SUPPORTED_ICON_SIZES = exports.SUPPORTED_ICON_PIXEL_RATIOS = exports.MAX_RES_ICON_OVERRIDE = exports.ICON_RES_MAP = exports.TIMESTAMP_DATE_FORMAT = exports.UNKNOWN_ICON_PATH = exports.NEW_FOLDER_ICON = exports.MOUNTED_FOLDER_ICON = exports.COMPRESSED_FOLDER_ICON = exports.FOLDER_FRONT_ICON = exports.FOLDER_BACK_ICON = exports.FOLDER_ICON = exports.FAVICON_BASE_PATH = exports.SHORTCUT_ICON = exports.SESSION_FILE = exports.ICON_CACHE_EXTENSION = exports.YT_ICON_CACHE = exports.ICON_CACHE = exports.USER_ICON_PATH = exports.PHOTO_ICON = exports.ICON_PATH = exports.ROOT_SHORTCUT = exports.SYSTEM_PATH = exports.ROOT_NAME = exports.SAVE_TITLE_CHAR = exports.DYNAMIC_EXTENSION = exports.DYNAMIC_PREFIX = exports.VIDEO_FILE_EXTENSIONS = exports.AUDIO_PLAYLIST_EXTENSIONS = exports.AUDIO_FILE_EXTENSIONS = exports.DEFAULT_INTERSECTION_OPTIONS = exports.ONE_DAY_IN_MILLISECONDS = exports.LONG_PRESS_DELAY_MS = exports.KEYPRESS_DEBOUNCE_MS = exports.TRANSITIONS_IN_SECONDS = exports.TRANSITIONS_IN_MILLISECONDS = exports.SYSTEM_SHORTCUT_DIRECTORIES = exports.START_MENU_PATH = exports.DESKTOP_PATH = exports.SYSTEM_PATHS = exports.SYSTEM_FILES = exports.SHORTCUT_EXTENSION = exports.SHORTCUT_APPEND = exports.PICUTRES_PATH = void 0;
exports.DISBALE_AUTO_INPUT_FEATURES = exports.HIGH_PRIORITY_ELEMENT = exports.HIGH_PRIORITY_REQUEST = void 0;
exports.BASE_2D_CONTEXT_OPTIONS = {
    alpha: false,
    desynchronized: true,
};
exports.IFRAME_CONFIG = {
    referrerPolicy: "no-referrer",
    sandbox: "allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts",
};
exports.DEFAULT_LOCALE = "en";
exports.DEFAULT_ASCENDING = true;
exports.DEFAULT_CLOCK_SOURCE = "local";
exports.DEFAULT_THEME = "defaultTheme";
exports.DEFAULT_WALLPAPER = "VANTA";
exports.DEFAULT_WALLPAPER_FIT = "fill";
exports.THIN_SCROLLBAR_WIDTH = 13;
exports.THIN_SCROLLBAR_WIDTH_NON_WEBKIT = 9;
exports.CLOCK_CANVAS_BASE_WIDTH = 68;
exports.SMALLEST_PNG_SIZE = 51;
exports.DEFAULT_WINDOW_SIZE = {
    height: 510,
    width: 640,
};
exports.DEFAULT_MAPPED_NAME = "Share";
exports.FOCUSABLE_ELEMENT = { tabIndex: -1 };
exports.DIV_BUTTON_PROPS = __assign({ as: "div", role: "button" }, exports.FOCUSABLE_ELEMENT);
exports.FS_HANDLES = "FileSystemAccessHandles";
exports.HOME = "/home/arcangelo";
exports.PICTURES_FOLDER = "".concat(exports.HOME, "/Pictures");
exports.VIDEOS_FOLDER = "".concat(exports.HOME, "/Videos");
exports.INDEX_FILE = "/index.html";
exports.PROMPT_FILE = "prompts.json";
exports.SLIDESHOW_FILE = "slideshow.json";
exports.SLIDESHOW_TIMEOUT_IN_MILLISECONDS = 15000;
exports.ICON_GIF_SECONDS = 2;
exports.ICON_GIF_FPS = 24;
exports.PEEK_MAX_WIDTH = 200;
exports.LIST_VIEW_ANIMATION = {
    animate: { opacity: 1 },
    initial: { opacity: 0 },
    transition: { duration: 0.15 },
};
exports.HEIF_IMAGE_FORMATS = new Set([
    ".heic",
    ".heics",
    ".heif",
    ".heifs",
    ".avci",
    ".avcs",
]);
exports.TIFF_IMAGE_FORMATS = new Set([
    ".cr2",
    ".dng",
    ".nef",
    ".tif",
    ".tiff",
]);
exports.CLIPBOARD_FILE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png"]);
exports.IMAGE_FILE_EXTENSIONS = new Set(__spreadArray(__spreadArray(__spreadArray([], exports.HEIF_IMAGE_FORMATS, true), exports.TIFF_IMAGE_FORMATS, true), [
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
], false));
exports.UNSUPPORTED_SLIDESHOW_EXTENSIONS = new Set(__spreadArray(__spreadArray(__spreadArray([], exports.HEIF_IMAGE_FORMATS, true), exports.TIFF_IMAGE_FORMATS, true), [
    ".jxl",
    ".qoi",
    ".svg",
], false));
exports.TEXT_EDITORS = ["MonacoEditor", "Vim"];
exports.CURSOR_FILE_EXTENSIONS = new Set([".ani", ".cur"]);
exports.SUMMARIZABLE_FILE_EXTENSIONS = new Set([
    ".html",
    ".htm",
    ".whtml",
    ".md",
    ".txt",
    ".pdf",
]);
exports.EDITABLE_IMAGE_FILE_EXTENSIONS = new Set([
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
exports.MENU_SEPERATOR = { seperator: true };
exports.MILLISECONDS_IN_SECOND = 1000;
exports.MILLISECONDS_IN_MINUTE = 60000;
exports.MILLISECONDS_IN_DAY = 86400000;
exports.MOUNTABLE_EXTENSIONS = new Set([".iso", ".jsdos", ".wsz", ".zip"]);
exports.SPREADSHEET_FORMATS = [
    ".csv",
    ".numbers",
    ".ods",
    ".xls",
    ".xlsx",
];
exports.MP3_MIME_TYPE = "audio/mpeg";
exports.VIDEO_FALLBACK_MIME_TYPE = "video/mp4";
exports.NON_BREAKING_HYPHEN = "\u2011";
exports.ONE_TIME_PASSIVE_EVENT = {
    once: true,
    passive: true,
};
exports.PREVENT_SCROLL = { preventScroll: true };
exports.PROCESS_DELIMITER = "__";
exports.SAVE_PATH = "".concat(exports.HOME, "/Snapshots");
exports.PICUTRES_PATH = "".concat(exports.HOME, "/Pictures");
exports.SHORTCUT_APPEND = " - Shortcut";
exports.SHORTCUT_EXTENSION = ".url";
exports.SYSTEM_FILES = new Set(["desktop.ini"]);
exports.SYSTEM_PATHS = new Set(["/.deletedFiles.log"]);
exports.DESKTOP_PATH = "".concat(exports.HOME, "/Desktop");
exports.START_MENU_PATH = "".concat(exports.HOME, "/Start Menu");
exports.SYSTEM_SHORTCUT_DIRECTORIES = new Set([exports.DESKTOP_PATH]);
exports.TRANSITIONS_IN_MILLISECONDS = {
    DOUBLE_CLICK: 500,
    LONG_PRESS: 500,
    MOUSE_IN_OUT: 300,
    TASKBAR_ITEM: 400,
    WINDOW: 250,
};
exports.TRANSITIONS_IN_SECONDS = {
    TASKBAR_ITEM: exports.TRANSITIONS_IN_MILLISECONDS.TASKBAR_ITEM / exports.MILLISECONDS_IN_SECOND,
    WINDOW: exports.TRANSITIONS_IN_MILLISECONDS.WINDOW / exports.MILLISECONDS_IN_SECOND,
};
exports.KEYPRESS_DEBOUNCE_MS = 150;
exports.LONG_PRESS_DELAY_MS = 750;
exports.ONE_DAY_IN_MILLISECONDS = 86400000;
exports.DEFAULT_INTERSECTION_OPTIONS = {
    rootMargin: "3px",
    threshold: 0,
};
exports.AUDIO_FILE_EXTENSIONS = new Set([".aac", ".oga", ".wav"]);
exports.AUDIO_PLAYLIST_EXTENSIONS = new Set([".asx", ".m3u", ".pls"]);
exports.VIDEO_FILE_EXTENSIONS = new Set([
    ".m4v",
    ".mkv",
    ".mov",
    ".mp4",
    ".ogg",
    ".ogm",
    ".ogv",
    ".webm",
]);
exports.DYNAMIC_PREFIX = ["nostr:"];
exports.DYNAMIC_EXTENSION = new Set(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], exports.AUDIO_FILE_EXTENSIONS, true), exports.AUDIO_PLAYLIST_EXTENSIONS, true), exports.IMAGE_FILE_EXTENSIONS, true), exports.TIFF_IMAGE_FORMATS, true), exports.VIDEO_FILE_EXTENSIONS, true), [
    ".ani",
    ".exe",
    ".mp3",
    ".sav",
    ".whtml",
], false));
exports.SAVE_TITLE_CHAR = "\u25CF";
exports.ROOT_NAME = "My PC";
exports.SYSTEM_PATH = "/System";
exports.ROOT_SHORTCUT = "".concat(exports.ROOT_NAME, ".url");
exports.ICON_PATH = "".concat(exports.SYSTEM_PATH, "/Icons");
exports.PHOTO_ICON = "".concat(exports.ICON_PATH, "/photo.webp");
exports.USER_ICON_PATH = "".concat(exports.HOME, "/Icons");
exports.ICON_CACHE = "".concat(exports.USER_ICON_PATH, "/Cache");
exports.YT_ICON_CACHE = "".concat(exports.ICON_CACHE, "/YouTube");
exports.ICON_CACHE_EXTENSION = ".cache";
exports.SESSION_FILE = "/session.json";
exports.SHORTCUT_ICON = "".concat(exports.ICON_PATH, "/shortcut.webp");
exports.FAVICON_BASE_PATH = "/favicon.ico";
exports.FOLDER_ICON = "".concat(exports.ICON_PATH, "/folder.webp");
exports.FOLDER_BACK_ICON = "".concat(exports.ICON_PATH, "/folder_back.webp");
exports.FOLDER_FRONT_ICON = "".concat(exports.ICON_PATH, "/folder_front.webp");
exports.COMPRESSED_FOLDER_ICON = "".concat(exports.ICON_PATH, "/compressed.webp");
exports.MOUNTED_FOLDER_ICON = "".concat(exports.ICON_PATH, "/mounted.webp");
exports.NEW_FOLDER_ICON = "".concat(exports.ICON_PATH, "/new_folder.webp");
exports.UNKNOWN_ICON_PATH = "".concat(exports.ICON_PATH, "/unknown.webp");
exports.TIMESTAMP_DATE_FORMAT = {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    year: "numeric",
};
exports.ICON_RES_MAP = {
    64: 96,
};
exports.MAX_RES_ICON_OVERRIDE = {
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
exports.SUPPORTED_ICON_PIXEL_RATIOS = [3, 2, 1];
exports.SUPPORTED_ICON_SIZES = [16, 32, 48, 96, 144];
exports.MAX_ICON_SIZE = 144;
exports.DEFAULT_TEXT_FILE_SAVE_PATH = "".concat(exports.DESKTOP_PATH, "/Untitled.txt");
exports.DEFAULT_SCROLLBAR_WIDTH = 17;
exports.TASKBAR_HEIGHT = 30;
exports.PACKAGE_DATA = {
    alias: "arcangelOS",
    author: {
        email: "henry.arcangello@gmail.com",
        name: "Henrique Arcangelo",
        npub: "",
        url: "https://github.com/ARCANGEL0",
    },
    description: "ArcangelOS portfolio",
    license: "MIT",
    version: "3.3.01",
};
exports.BASE_ZIP_CONFIG = {
    consume: true,
    level: 0,
    mem: 8,
};
exports.HIGH_PRIORITY_REQUEST = { priority: "high" };
exports.HIGH_PRIORITY_ELEMENT = {
    fetchpriority: "high",
};
exports.DISBALE_AUTO_INPUT_FEATURES = {
    autoCapitalize: "off",
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
};
