import type { Locator } from "@playwright/test";

export const RIGHT_CLICK = { button: "right" } as Parameters<
  Locator["click"]
>[0];

export const BACKGROUND_CANVAS_SELECTOR = "main>canvas";
export const FIRST_FILE_ENTRY_SELECTOR = "main>ol>li:first-child";
export const WINDOW_SELECTOR = "main>.react-draggable>section";
export const WINDOW_TITLEBAR_SELECTOR = `${WINDOW_SELECTOR}>div>header`;
export const TASKBAR_SELECTOR = "main>nav";
export const TASKBAR_ENTRIES_SELECTOR = `${TASKBAR_SELECTOR}>ol>li`;
export const CONTEXT_MENU_SELECTOR = "#__next>nav";

export const DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS = new Set([
  "webkit",
  "firefox",
]);
export const OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);
export const SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);

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
export const DESKTOP_MENU_ITEMS = [
  [/^Sort by$/, true],
  [/^Refresh$/, true],
  [/^Background$/, true],
  [/^Add file\(s\)$/, true],
  [/^Open Terminal here$/, true],
  [/^Paste$/, true],
  [/^New$/, true],
  [/^View page source$/, true],
  [/^Inspect$/, true],
  [/^Properties$/, false],
];

export const TEST_APP = "FileExplorer";
export const TEST_APP_TITLE = "My PC";
export const TEST_APP_ICON = /\/pc\.(webp|png)$/;
export const TEST_ROOT_FILE = /^session.json$/;
export const TEST_SEARCH = "CREDITS";
export const TEST_SEARCH_RESULT = /^CREDITS.md$/;

export const CLOCK_REGEX = /^(1[0-2]|0?[1-9])(?::[0-5]\d){2}\s?(AM|PM)$/;

export const BASE_APP_TITLE = "daedalOS";
