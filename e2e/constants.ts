import { type Locator } from "@playwright/test";
import { type SessionData } from "contexts/session/types";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var capturedConsoleLogs: string[] | undefined;

  interface Window {
    DEBUG_DEFAULT_SESSION?: SessionData;
  }
}

export const EXCLUDED_CONSOLE_LOGS = (
  browserName: string,
  testName?: string
): string[] => {
  // Generic messages
  const excludedConsoleLogs = [
    "[HMR] connected",
    "No available adapters.",
    "not used within a few seconds",
    "[Fast Refresh] rebuilding",
    "[Fast Refresh] done in",
    "[Fast Refresh] performing full reload",
    "Cannot update a component (`Unknown`) while rendering a different component",
    "browserContext.",
    "Web browser doesn't support Web Audio API",
    "Slow execution detected",
  ];

  if (browserName === "webkit") {
    excludedConsoleLogs.push(
      // sandbox=allow-presentation is not supported in webkit
      "Error while parsing the 'sandbox' attribute: 'allow-presentation' is an invalid sandbox flag.",
      'Viewport argument key "interactive-widget" not recognized and ignored.'
    );
  } else if (browserName === "firefox") {
    excludedConsoleLogs.push(
      "Found a sectioned h1 element with no specified font-size or margin properties."
    );
  }

  if (process.env.CI) {
    if (browserName === "chromium") {
      excludedConsoleLogs.push(
        "Failed to create WebGPU Context Provider",
        "WebGPU is experimental on this platform"
      );
    } else if (browserName === "firefox") {
      excludedConsoleLogs.push(
        "WebGL warning",
        "Failed to create WebGL context",
        "A WebGL context could not be created",
        "Error creating WebGL context",
        "'experimental-webgl' (value of argument 1) is not a valid value"
      );
    } else if (browserName === "webkit") {
      excludedConsoleLogs.push(
        'THREE.WebGLRenderer: Argument 1 (\'contextType\') to OffscreenCanvas.getContext must be one of: "2d", "webgl", "webgl2", "bitmaprenderer", "webgpu"'
      );
    }
  }

  if (testName === "apps") {
    excludedConsoleLogs.push(
      // Browser
      "Cookie “AEC” has been rejected because it is in a cross-site context and its “SameSite” is “Lax” or “Strict”.",
      "Blocked autofocusing on a form control in a cross-origin subframe.",
      "Failed to load resource: the server responded with a status of 404 (Not Found)",
      'Error: "Content-Security-Policy:',
      "an ancestor violates the following Content Security Policy directive",
      // Messenger
      "WebSocket connection to 'wss://public.relaying.io/' failed:"
    );

    if (browserName === "firefox") {
      excludedConsoleLogs.push(
        // Messenger
        "Firefox can’t establish a connection to the server at wss://"
      );
    } else if (browserName === "webkit") {
      excludedConsoleLogs.push(
        // TIC-80
        "Unable to initialize SDL Audio: -1, No audio context available",
        "Unable to initialize SDL Game Controller: -1, Gamepads not supported",
        // Quake 3
        "WebGL: INVALID_ENUM: texParameter: invalid parameter name"
      );
    } else if (browserName === "chromium") {
      excludedConsoleLogs.push(
        // Browser
        "Blocked autofocusing on a <textarea> element in a cross-origin subframe"
      );
    }
  }

  return excludedConsoleLogs;
};

export type IsShown = boolean | ((browserName: string) => boolean);

export type MenuItems = Record<string, IsShown>;

type LocatorClickProps = Parameters<Locator["click"]>[0];
type LocatorWaitForProps = Parameters<Locator["waitFor"]>[0];

export const TYPE_DELAY = 75;

export const EXACT = { exact: true };
export const FORCE = { force: true };
export const RIGHT_CLICK = { button: "right" } as LocatorClickProps;
export const VISIBLE = { state: "visible" } as LocatorWaitForProps;

const APP_CONTAINER_SELECTOR = "div";
const VIEWPORT_SELECTOR = "div";
const WINDOW_DRAG_SELECTOR = ".react-draggable";
const FOCUSED_ENTRY_SELECTOR = ".focus-within";
const NEXT_JS_CONTAINER_SELECTOR = "body>#__next";
const ICON_SELECTOR = "figure>picture";

export const FAVICON_SELECTOR = "head>link[rel=icon]";
export const CONTEXT_MENU_SELECTOR = `${NEXT_JS_CONTAINER_SELECTOR}>nav`;
export const CONTEXT_MENU_ENTRIES_SELECTOR = `${CONTEXT_MENU_SELECTOR}>ol>li`;
export const DESKTOP_SELECTOR = `${NEXT_JS_CONTAINER_SELECTOR}>main`;
export const BACKGROUND_CANVAS_SELECTOR = `${DESKTOP_SELECTOR}>canvas`;
export const DESKTOP_ENTRIES_SELECTOR = `${DESKTOP_SELECTOR}>ol>li`;
export const SELECTION_SELECTOR = `${DESKTOP_SELECTOR}>ol>span`;
export const TASKBAR_SELECTOR = `${DESKTOP_SELECTOR}>nav:not([style])`;
export const TASKBAR_ENTRIES_SELECTOR = `${TASKBAR_SELECTOR}>ol`;
export const TASKBAR_ENTRY_SELECTOR = `${TASKBAR_ENTRIES_SELECTOR}>li`;
export const TASKBAR_ENTRY_PEEK_SELECTOR = `${TASKBAR_ENTRY_SELECTOR}>div:not([title])`;
export const TASKBAR_ENTRY_PEEK_IMAGE_SELECTOR = `${TASKBAR_ENTRY_PEEK_SELECTOR}>img`;
export const SEARCH_MENU_SELECTOR = `${DESKTOP_SELECTOR}>nav#searchMenu`;
export const SEARCH_MENU_INPUT_SELECTOR = `${SEARCH_MENU_SELECTOR} input[placeholder='Type here to search']`;
export const SEARCH_MENU_RESULTS_SELECTOR = `${SEARCH_MENU_SELECTOR}>div>.content>div>.list>figure:first-child>ol`;
export const SEARCH_BUTTON_SELECTOR = `${TASKBAR_SELECTOR}>[title='Type here to search']`;
export const START_BUTTON_SELECTOR = `${TASKBAR_SELECTOR}>[title=Start]`;
export const START_MENU_SELECTOR = `${DESKTOP_SELECTOR}>nav#startMenu`;
export const START_MENU_SIDEBAR_SELECTOR = `${START_MENU_SELECTOR}>nav`;
export const WINDOW_SELECTOR = `${DESKTOP_SELECTOR}>${WINDOW_DRAG_SELECTOR}>section`;
export const WINDOW_TITLEBAR_SELECTOR = `${WINDOW_SELECTOR}>${VIEWPORT_SELECTOR}>header`;
export const SHORTCUT_ICON_SELECTOR = `${ICON_SELECTOR}>img[src*=shortcut]`;
export const WINDOW_TITLEBAR_ICON_SELECTOR = `${WINDOW_TITLEBAR_SELECTOR}>button>${ICON_SELECTOR}`;
export const FILE_EXPLORER_NAV_SELECTOR = `${WINDOW_SELECTOR}>${VIEWPORT_SELECTOR}>${APP_CONTAINER_SELECTOR}>nav`;
export const FILE_EXPLORER_SEARCH_BOX_SELECTOR = `${FILE_EXPLORER_NAV_SELECTOR}>div>input[type=search]`;
export const FILE_EXPLORER_STATUS_BAR_SELECTOR = `${WINDOW_SELECTOR}>${VIEWPORT_SELECTOR}>${APP_CONTAINER_SELECTOR}>footer`;
export const FILE_EXPLORER_SELECTOR = `${WINDOW_SELECTOR}>${VIEWPORT_SELECTOR}>${APP_CONTAINER_SELECTOR}>ol`;
export const FILE_EXPLORER_SELECTION_SELECTOR = `${FILE_EXPLORER_SELECTOR}>span:last-of-type`;
export const FILE_EXPLORER_ENTRIES_SELECTOR = `${FILE_EXPLORER_SELECTOR}>li`;
export const FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR = `${FILE_EXPLORER_SELECTOR}>li${FOCUSED_ENTRY_SELECTOR}`;
export const FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR = `${FILE_EXPLORER_ENTRIES_SELECTOR}>button>figure>textarea`;
export const TERMINAL_SELECTOR = `${WINDOW_SELECTOR}>${VIEWPORT_SELECTOR}>${APP_CONTAINER_SELECTOR}>.terminal`;
export const TERMINAL_ROWS_SELECTOR = `${TERMINAL_SELECTOR}>.xterm-screen>.xterm-rows>div:not(:empty)`;
export const SHEEP_SELECTOR = `${DESKTOP_SELECTOR}>div>img[src^=data]`;

export const CALENDAR_LABEL = /^Calendar$/;
export const CLOCK_LABEL = /^Clock$/;
export const FILE_EXPLORER_ADDRESS_BAR_LABEL = /^Address$/;
export const START_BUTTON_LABEL = /^Start$/;

export const ACCESSIBILITY_EXCEPTION_IDS = [
  "aria-allowed-role",
  "image-redundant-alt",
  "meta-viewport",
];

export const CLIPBOARD_WRITE_HEADLESS_NOT_SUPPORTED_BROWSERS = new Set([
  "firefox",
  "webkit",
]);
export const DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS = new Set([
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker#browser_compatibility
  "webkit",
  "firefox",
]);
export const DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);
export const WEBGL_OFFSCREEN_NOT_SUPPORTED_BROWSERS = new Set(
  process.platform === "win32"
    ? [
        "webkit", // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility
      ]
    : []
);
export const MEDIA_RECORDER_HEADLESS_NOT_SUPPORTED_BROWSERS = new Set([
  "webkit",
]);
export const PYODIDE_HEADLESS_NOT_SUPPORTED_BROWSERS = new Set(["firefox"]);
export const WEBGPU_HEADLESS_NOT_SUPPORTED_BROWSERS = new Set([
  "firefox",
  "webkit",
]);

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
    !MEDIA_RECORDER_HEADLESS_NOT_SUPPORTED_BROWSERS.has(browserName),
  Inspect: true,
  Properties: false,
  "View page source": true,
};

export const CLOCK_MENU_ITEMS = [/^Local time$/, /^Server time$/];

export const TASKBAR_ENTRIES_MENU_ITEMS = (hasWebGpu: boolean): RegExp[] => [
  /^Enter full screen$/,
  ...(hasWebGpu ? [/^Show Talos button$/] : []),
  /^Show the desktop$/,
];

export const TASKBAR_ENTRY_MENU_ITEMS = [
  /^Restore$/,
  /^Minimize$/,
  /^Maximize$/,
  /^Close$/,
];

export const START_BUTTON_MENU_ITEMS = [
  /^Terminal$/,
  /^File Explorer$/,
  /^Run$/,
  /^Desktop$/,
];

export const START_MENU_APPS = [
  /^Browser$/,
  /^DevTools$/,
  /^IRC$/,
  /^Marked$/,
  /^Messenger$/,
  /^Monaco Editor$/,
  /^Paint$/,
  /^PDF$/,
  /^Photo Viewer$/,
  /^Stable Diffusion$/,
  /^Terminal$/,
  /^TinyMCE$/,
  /^Video Player$/,
  /^Vim$/,
  /^Webamp$/,
];

export const START_MENU_FOLDERS = {
  Emulators: [
    /^BoxedWine$/,
    /^EmulatorJS$/,
    /^js-dos$/,
    /^Ruffle$/,
    /^Virtual x86$/,
  ],
  Games: [/^ClassiCube$/, /^DX-Ball$/, /^Quake III Arena$/, /^Space Cadet$/],
};

export const TEST_APP_CONTAINER_APP = "Marked";
export const TEST_APP_CONTAINER_APP_TITLE = (file: string | null): string =>
  `${file || ""}.url - ${TEST_APP_CONTAINER_APP}`;

export const TEST_APP = "FileExplorer";
export const TEST_APP_TITLE = /^My PC$/;
export const TEST_APP_TITLE_TEXT = "My PC";
export const TEST_APP_ICON = /\/pc\.(webp|png)$/;
export const TEST_APP_URL: Record<string, string> = {
  Browser: "http://localhost",
  Marked: "/CREDITS.md",
};

export const TEST_IMAGE_NAME = "image.png";
export const TEST_DESKTOP_FILE = /^Public$/;
export const TEST_ROOT_ARCHIVE = /^archive.zip$/;
export const TEST_ROOT_FILE = /^CREDITS.md$/;
export const TEST_ROOT_FILE_COPY = /^CREDITS \(1\).md$/;
export const TEST_ROOT_FILE_2 = /^favicon.ico$/;
export const TEST_ROOT_FILE_TEXT = "CREDITS.md";
export const TEST_ROOT_FILE_DEFAULT_APP = "Marked";
export const TEST_ROOT_FILE_ALT_APP = "Monaco Editor";
export const TEST_ROOT_FILE_TOOLTIP =
  /^Type: Markdown File\nSize: \d\.\d\d KB\nDate modified: \d{4}-\d{2}-\d{2} \d{1,2}:\d{2} (?:AM|PM)$/;

export const TEST_SEARCH = "CREDITS";
export const TEST_SEARCH_RESULT = /^CREDITS.md$/;
export const TEST_SEARCH_RESULT_TITLE = /^\/CREDITS.md/;

export const NEW_FOLDER_LABEL = /^New folder$/;
export const NEW_FILE_LABEL = /^New Text Document.txt$/;
export const NEW_FILE_LABEL_TEXT = "New Text Document.txt";

export const CLOCK_REGEX = /^(1[0-2]|0?[1-9])(?::[0-5]\d){2}\s?(AM|PM)$/;

export const BASE_APP_TITLE = "daedalOS";
export const BASE_APP_FAVICON = /^\/favicon.ico$/;
export const BASE_APP_FAVICON_TEXT = "/favicon.ico";

export const UNKNOWN_ICON_PATH = "/System/Icons/48x48/unknown.webp";

const OG_REQUIRED_TAGS = ["title", "image", "url", "type"];

export const OG_TAGS = [...OG_REQUIRED_TAGS, "description"];

export const TERMINAL_BASE_CD = "/Users/Public";

export const ROOT_PUBLIC_FOLDER = "public";

export const ROOT_PUBLIC_TEST_FILE = "desktop.ini";

export const ROOT_FOLDER_VIEW = "details";

export const CURSOR_SPACE_LENGTH = 1;

export const TAB_SPACE_LENGTH = 4;

export const FILE_EXPLORER_COLUMN_HEIGHT = 25;

export const WINDOW_RESIZE_HANDLE_WIDTH = 6;

export const DEFAULT_SESSION = {} as SessionData;
