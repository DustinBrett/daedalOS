import type { Locator } from "@playwright/test";

type MenuItems = Record<string, boolean | ((browserName: string) => boolean)>;

export const RIGHT_CLICK = { button: "right" } as Parameters<
  Locator["click"]
>[0];
export const EXACT = { exact: true };

const DESKTOP_ELEMENT = "main";
const NEXT_JS_CONTAINER = "#__next";
const ENTRY_SELECTOR = "ol>li";

export const BACKGROUND_CANVAS_SELECTOR = `${DESKTOP_ELEMENT}>canvas`;
export const DESKTOP_FILE_ENTRY_SELECTOR = `${DESKTOP_ELEMENT}>${ENTRY_SELECTOR}`;
export const WINDOW_SELECTOR = `${DESKTOP_ELEMENT}>.react-draggable>section`;
export const WINDOW_TITLEBAR_SELECTOR = `${WINDOW_SELECTOR}>div>header`;
export const TASKBAR_SELECTOR = `${DESKTOP_ELEMENT}>nav`;
export const TASKBAR_ENTRY_SELECTOR = `${TASKBAR_SELECTOR}>${ENTRY_SELECTOR}`;
export const CONTEXT_MENU_SELECTOR = `${NEXT_JS_CONTAINER}>nav`;
export const SELECTION_SELECTOR = `${DESKTOP_ELEMENT}>ol>span`;

export const ACCESSIBILITY_EXCEPTION_IDS = ["meta-viewport"];

export const DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS = new Set([
  "webkit",
  "firefox",
]);
export const OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);
export const SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);

// TODO: Fix this, doesn't fail in BrowserStack
export const FILE_DRAG_NOT_WORKING_BROWSERS = new Set(["webkit"]);

export const FILE_MENU_ITEMS = [
  /^Open$/,
  /^Open with$/,
  /^Add to archive...$/,
  /^Download$/,
  /^Cut$/,
  /^Copy$/,
  /^Create shortcut$/,
  /^Delete$/,
  /^Rename$/,
  /^Properties$/,
];
export const FOLDER_MENU_ITEMS: MenuItems = {
  "Add file(s)": true,
  "Map directory": (browserName: string): boolean =>
    !DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS.has(browserName),
  New: true,
  "Open Terminal here": true,
  Paste: true,
  Properties: true,
  Refresh: true,
  "Sort by": true,
};
export const DESKTOP_MENU_ITEMS: MenuItems = {
  ...FOLDER_MENU_ITEMS,
  Background: true,
  "Capture screen": (browserName: string): boolean =>
    !SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS.has(browserName),
  Inspect: true,
  Properties: false,
  "View page source": true,
};

// TODO: Randomize test data
export const TEST_APP_CONTAINER_APP = "Marked";
export const TEST_APP = "FileExplorer";
export const TEST_APP_TITLE = "My PC";
export const TEST_APP_ICON = /\/pc\.(webp|png)$/;
export const TEST_ROOT_FILE = /^session.json$/;
export const TEST_ROOT_FILE_TOOLTIP =
  /^Type: JSON File\nSize: \d{3} bytes\nDate modified: \b\d{4}-\d{2}-\d{2} \d{1,2}:\d{2} (?:AM|PM)$/;
export const TEST_SEARCH = "CREDITS";
export const TEST_SEARCH_RESULT = /^CREDITS.md$/;

export const NEW_FOLDER_LABEL = /^New folder$/;
export const NEW_FILE_LABEL = /^New Text Document.txt$/;

export const CLOCK_REGEX = /^(1[0-2]|0?[1-9])(?::[0-5]\d){2}\s?(AM|PM)$/;

export const BASE_APP_TITLE = "daedalOS";
