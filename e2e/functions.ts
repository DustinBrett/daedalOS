import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import {
  type ConsoleMessage,
  type Locator,
  type Page,
  type Response,
  expect,
} from "@playwright/test";
import {
  type IsShown,
  type MenuItems,
  BACKGROUND_CANVAS_SELECTOR,
  CALENDAR_LABEL,
  CLOCK_LABEL,
  CLOCK_REGEX,
  CONTEXT_MENU_ENTRIES_SELECTOR,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ENTRIES_SELECTOR,
  DESKTOP_SELECTOR,
  EXACT,
  EXCLUDED_CONSOLE_LOGS,
  FAVICON_SELECTOR,
  FILE_EXPLORER_ADDRESS_BAR_LABEL,
  FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR,
  FILE_EXPLORER_ENTRIES_SELECTOR,
  FILE_EXPLORER_NAV_SELECTOR,
  FILE_EXPLORER_SELECTOR,
  RIGHT_CLICK,
  SEARCH_BUTTON_SELECTOR,
  SEARCH_MENU_SELECTOR,
  SELECTION_SELECTOR,
  SHEEP_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
  START_MENU_SIDEBAR_SELECTOR,
  TASKBAR_ENTRIES_SELECTOR,
  TASKBAR_ENTRY_PEEK_IMAGE_SELECTOR,
  TASKBAR_ENTRY_PEEK_SELECTOR,
  TASKBAR_ENTRY_SELECTOR,
  TASKBAR_SELECTOR,
  TEST_APP,
  TEST_APP_CONTAINER_APP,
  TYPE_DELAY,
  UNKNOWN_ICON_PATH,
  WEBGL_OFFSCREEN_NOT_SUPPORTED_BROWSERS,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_ICON_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
  SEARCH_MENU_INPUT_SELECTOR,
  SEARCH_MENU_RESULTS_SELECTOR,
  FILE_EXPLORER_SEARCH_BOX_SELECTOR,
  TERMINAL_ROWS_SELECTOR,
  TERMINAL_SELECTOR,
  ROOT_PUBLIC_FOLDER,
  CURSOR_SPACE_LENGTH,
  TAB_SPACE_LENGTH,
  SHORTCUT_ICON_SELECTOR,
  DEFAULT_SESSION,
} from "e2e/constants";

type TestProps = {
  browserName?: string;
  headless?: boolean;
  page: Page;
};

type TestPropsWithBrowser = TestProps & {
  browserName: string;
};

type TestPropsWithSelection = TestProps & {
  container?: string;
  selection: {
    height: number;
    up?: boolean;
    width: number;
    x: number;
    y: number;
  };
};

type DocumentWithVendorFullscreen = Document & {
  mozFullScreenElement?: HTMLElement;
  webkitFullscreenElement?: HTMLElement;
};

type MessageType = ReturnType<ConsoleMessage["type"]>;

export const captureConsoleLogs =
  (testName = "") =>
  ({ browserName, page }: TestPropsWithBrowser): void => {
    page.on("console", (msg) => {
      const messageType = msg.type();

      if (
        messageType === ("timeStamp" as MessageType) ||
        (testName === "apps" && (process.env.CI || messageType !== "error"))
      ) {
        return;
      }

      const text = msg.text().trim();
      const isExcludedMessage =
        !text ||
        EXCLUDED_CONSOLE_LOGS(browserName, testName).some((excluded) =>
          text.includes(excluded)
        );

      if (!isExcludedMessage) throw new Error(text);
    });
  };

export const filterMenuItems = (
  menuItems: MenuItems,
  browserName: string
): [string, IsShown][] =>
  Object.entries(menuItems).map(([label, shown]) => [
    label,
    typeof shown === "boolean" ? shown : shown(browserName),
  ]);

export const disableOffscreenCanvas = ({ page }: TestProps): Promise<void> =>
  page.addInitScript(() => {
    delete (window as Partial<Window & typeof globalThis>).OffscreenCanvas;
  });

export const disableWallpaper = ({ page }: TestProps): Promise<void> =>
  page.addInitScript(() => {
    window.DEBUG_DISABLE_WALLPAPER = true;
  });

// action
export const mockPictureSlideshowRequest = async ({
  page,
}: TestProps): Promise<() => Promise<void>> => {
  let requested = false;

  await page.route("/Users/Public/Pictures/slideshow.json", (route) =>
    route.fulfill({ body: JSON.stringify([UNKNOWN_ICON_PATH]) })
  );
  await page.route(UNKNOWN_ICON_PATH, () => {
    requested = true;
  });

  return () => expect(() => expect(requested).toBeTruthy()).toPass();
};

// locator->action
export const clickDesktop = async (
  { page }: TestProps,
  right = false,
  x = 0,
  y = 0,
  offset = 0
): Promise<void> =>
  page.locator(DESKTOP_SELECTOR).click({
    button: right ? "right" : undefined,
    ...(x || y ? { position: { x: x + offset, y: y + offset } } : {}),
  });

export const clickSearchButton = async (
  { page }: TestProps,
  right = false
): Promise<void> =>
  page.locator(SEARCH_BUTTON_SELECTOR).click(right ? RIGHT_CLICK : undefined);

export const clickStartButton = async (
  { page }: TestProps,
  right = false
): Promise<void> =>
  page.locator(START_BUTTON_SELECTOR).click(right ? RIGHT_CLICK : undefined);

export const clickStartMenuEntry = async (
  label: RegExp | string,
  { page }: TestProps,
  right = false
): Promise<void> =>
  page
    .locator(START_MENU_SELECTOR)
    .getByLabel(label, EXACT)
    .click(right ? RIGHT_CLICK : undefined);

export const clickTaskbar = async (
  { page }: TestProps,
  right = false
): Promise<void> => {
  const taskEntriesSelector = page.locator(TASKBAR_ENTRIES_SELECTOR);
  const { height = 0, width = 0 } =
    (await taskEntriesSelector.boundingBox()) || {};

  taskEntriesSelector.click({
    button: right ? "right" : undefined,
    position: { x: width / 2, y: height / 2 },
  });
};

export const doubleClickWindowTitlebar = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(WINDOW_TITLEBAR_SELECTOR).dblclick();

export const doubleClickWindowTitlebarIcon = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(WINDOW_TITLEBAR_ICON_SELECTOR).dblclick();

export const dragFileExplorerEntryToDesktop = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_ENTRIES_SELECTOR)
    .getByLabel(label)
    .dragTo(page.locator(DESKTOP_SELECTOR), {
      targetPosition: { x: 1, y: 1 },
    });

export const dragDesktopEntryToFileExplorer = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> => {
  const { height = 0, width = 0 } =
    (await page.locator(FILE_EXPLORER_SELECTOR).boundingBox()) || {};

  page
    .locator(DESKTOP_ENTRIES_SELECTOR)
    .getByLabel(label)
    .dragTo(page.locator(FILE_EXPLORER_SELECTOR), {
      targetPosition: {
        x: width - 5,
        y: height - 5,
      },
    });
};

export const dragWindowToDesktop = async ({
  page,
}: TestProps): Promise<void> => {
  const { width = 0, height = 0 } =
    (await page.locator(WINDOW_TITLEBAR_SELECTOR).boundingBox()) || {};

  expect(width).toBeGreaterThan(0);
  expect(height).toBeGreaterThan(0);

  await page
    .locator(WINDOW_TITLEBAR_SELECTOR)
    .dragTo(page.locator(DESKTOP_SELECTOR), {
      targetPosition: { x: width / 2, y: height / 2 },
    });
};

export const focusOnWindow = async ({ page }: TestProps): Promise<void> =>
  page.locator(WINDOW_SELECTOR).focus();

export const hoverOnTaskbarEntry = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(label).hover();

export const pressDesktopKeys = async (
  keys: string,
  { page }: TestProps
): Promise<void> => page.locator(DESKTOP_SELECTOR).press(keys);

export const pressFileExplorerAddressBarKeys = async (
  keys: string,
  { page }: TestProps
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_NAV_SELECTOR)
    .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL)
    .press(keys);

export const pressFileExplorerEntryKeys = async (
  label: RegExp,
  keys: string,
  { page }: TestProps
): Promise<void> =>
  page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label).press(keys);

export const pressWindowKeys = async (
  keys: string,
  { page }: TestProps
): Promise<void> => page.locator(WINDOW_SELECTOR).press(keys);

// locator->first->action
export const clickFirstDesktopEntry = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(DESKTOP_ENTRIES_SELECTOR).first().click();

export const dragFirstDesktopEntryToWindow = async ({
  page,
}: TestProps): Promise<void> =>
  page
    .locator(DESKTOP_ENTRIES_SELECTOR)
    .first()
    .dragTo(page.locator(WINDOW_SELECTOR));

// locator->getByLabel->action
export const clickClock = async (
  { page }: TestProps,
  clickCount = 1,
  right = false
): Promise<void> =>
  page
    .locator(TASKBAR_SELECTOR)
    .getByLabel(CLOCK_LABEL)
    .click({ button: right ? "right" : undefined, clickCount });

export const clickCloseWindow = async ({ page }: TestProps): Promise<void> =>
  page
    .locator(WINDOW_TITLEBAR_SELECTOR)
    .getByLabel(/^Close$/)
    .click();

export const clickContextMenuEntry = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  page.locator(CONTEXT_MENU_ENTRIES_SELECTOR).getByLabel(label, EXACT).click();

export const clickFileExplorerNavButton = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  page.locator(FILE_EXPLORER_NAV_SELECTOR).getByLabel(label).click();

export const clickFileExplorerAddressBar = async (
  { page }: TestProps,
  right = false,
  clickCount = 1
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_NAV_SELECTOR)
    .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL)
    .click({ button: right ? "right" : undefined, clickCount });

export const clickFileExplorerSearchBox = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(FILE_EXPLORER_SEARCH_BOX_SELECTOR).click();

export const clickFileExplorer = async (
  { page }: TestProps,
  right = false,
  x = 0,
  y = 0
): Promise<void> =>
  page.locator(FILE_EXPLORER_SELECTOR).click({
    button: right ? "right" : undefined,
    ...(x || y ? { position: { x, y } } : {}),
  });

export const clickFileExplorerEntry = async (
  label: RegExp | string,
  { page }: TestProps,
  right = false,
  clickCount = 1
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_ENTRIES_SELECTOR)
    .getByLabel(label, EXACT)
    .click({ button: right ? "right" : undefined, clickCount });

export const clickMaximizeWindow = async ({ page }: TestProps): Promise<void> =>
  page
    .locator(WINDOW_TITLEBAR_SELECTOR)
    .getByLabel(/^Maximize$/)
    .click();

export const clickMinimizeWindow = async ({ page }: TestProps): Promise<void> =>
  page
    .locator(WINDOW_TITLEBAR_SELECTOR)
    .getByLabel(/^Minimize$/)
    .click();

export const clickTaskbarEntry = async (
  label: RegExp | string,
  { page }: TestProps,
  right = false
): Promise<void> =>
  page
    .locator(TASKBAR_ENTRY_SELECTOR)
    .getByLabel(label, EXACT)
    .click(right ? RIGHT_CLICK : undefined);

export const fileExplorerRenameEntry = async (
  newName: string,
  { page }: TestProps
): Promise<void> => {
  await page
    .locator(FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR)
    .pressSequentially(newName);
  await page.locator(FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR).press("Enter");
};

export const typeInFileExplorerAddressBar = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_NAV_SELECTOR)
    .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL)
    .pressSequentially(text, { delay: TYPE_DELAY });

export const typeInFileExplorerSearchBox = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_SEARCH_BOX_SELECTOR)
    .pressSequentially(text, { delay: TYPE_DELAY });

export const typeInTaskbarSearchBar = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  page
    .locator(SEARCH_MENU_INPUT_SELECTOR)
    .pressSequentially(text, { delay: TYPE_DELAY });

// expect->toHave
export const pageHasTitle = async (
  title: string,
  { page }: TestProps
): Promise<void> => expect(page).toHaveTitle(title);

// expect->locator->toHave
export const contextMenuHasCount = async (
  count: number,
  { page }: TestProps
): Promise<void> =>
  expect(
    page
      .locator(CONTEXT_MENU_ENTRIES_SELECTOR)
      .filter({ hasNot: page.locator("hr") })
  ).toHaveCount(count);

export const pageHasIcon = async (
  icon: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(FAVICON_SELECTOR)).toHaveAttribute("href", icon);

// evaluate->action
export const triggerFullscreenDetection = async ({
  browserName,
  page,
}: TestProps): Promise<void> =>
  page.evaluate((browser) => {
    (document as DocumentWithVendorFullscreen)[
      browser === "firefox" ? "webkitFullscreenElement" : "mozFullScreenElement"
    ] = document.documentElement;
    document.dispatchEvent(new Event("fullscreenchange"));
  }, browserName);

export const mockSaveFilePicker = async (
  { page }: TestProps,
  fileName: string
): Promise<void> =>
  page.evaluate(
    ([downloadName]) => {
      window.showSaveFilePicker = () => {
        const link = document.createElement("a");

        link.href = "data:null;,";
        link.download = downloadName;

        link.click();

        return Promise.resolve({} as FileSystemFileHandle);
      };
    },
    [fileName]
  );

// evaluate
export const getHostname = async ({ page }: TestProps): Promise<string> =>
  page.evaluate(() => window.location.hostname);

export const windowAnimationIsFinished = async ({
  page,
}: TestProps): Promise<Animation[]> =>
  page
    .locator(WINDOW_SELECTOR)
    .evaluate((element) =>
      Promise.all(element.getAnimations().map(({ finished }) => finished))
    );

// expect->evaluate->toPass
export const backgroundIsUrl = async ({ page }: TestProps): Promise<void> =>
  expect(async () =>
    expect(
      await page.evaluate(() =>
        /^url\(.*?\)/.exec(
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue("--before-background")
        )
      )
    ).toBeTruthy()
  ).toPass();

export const sessionIsWriteable = async ({
  page,
}: {
  page: Page;
}): Promise<void> =>
  expect(async () =>
    expect(await page.evaluate(() => window.sessionIsWriteable)).toBeTruthy()
  ).toPass();

export const windowIsMaximized = async (
  { page }: TestProps,
  maximized = true
): Promise<void> =>
  expect(async () =>
    expect(
      await page.evaluate(
        ([windowSelector, taskbarSelector]) => {
          const {
            clientWidth: windowWidth = 0,
            clientHeight: windowHeight = 0,
          } = document.querySelector(windowSelector) || {};
          const { clientHeight: taskbarHeight = 0 } =
            document.querySelector(taskbarSelector) || {};

          return (
            windowWidth === window.innerWidth &&
            windowHeight === window.innerHeight - taskbarHeight
          );
        },
        [WINDOW_SELECTOR, TASKBAR_SELECTOR]
      )
    ).toBe(maximized)
  ).toPass();

// expect->locator
export const canvasBackgroundIsHidden = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeHidden();

export const contextMenuIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(CONTEXT_MENU_SELECTOR)).toBeHidden();

export const contextMenuIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(CONTEXT_MENU_SELECTOR)).toBeVisible();

export const desktopIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(DESKTOP_SELECTOR)).toBeVisible();

export const searchMenuIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(SEARCH_MENU_SELECTOR)).toBeHidden();

export const searchMenuIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(SEARCH_MENU_SELECTOR)).toBeVisible();

export const sheepIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(SHEEP_SELECTOR)).toBeVisible();

export const startButtonIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(START_BUTTON_SELECTOR)).toBeVisible();

export const startMenuIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(START_MENU_SELECTOR)).toBeHidden();

export const startMenuIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(START_MENU_SELECTOR)).toBeVisible();

export const taskbarIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(TASKBAR_SELECTOR)).toBeVisible();

export const windowIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toBeHidden();

export const windowIsTransparent = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toHaveCSS("opacity", "0");

export const windowIsOpaque = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toHaveCSS("opacity", "1");

// expect->locator->getBy
export const calendarIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(
    page.locator(DESKTOP_SELECTOR).getByLabel(CALENDAR_LABEL)
  ).toBeVisible();

export const contextMenuEntryIsHidden = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(CONTEXT_MENU_ENTRIES_SELECTOR).getByLabel(label, EXACT)
  ).toBeHidden();

export const contextMenuEntryIsVisible = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(CONTEXT_MENU_ENTRIES_SELECTOR).getByLabel(label, EXACT)
  ).toBeVisible();

export const desktopEntryIsHidden = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(DESKTOP_ENTRIES_SELECTOR).getByLabel(label)).toBeHidden();

const entryIsVisible = async (
  selector: string,
  label: RegExp | string,
  page: Page
): Promise<void> =>
  expect(async () =>
    expect(page.locator(selector).getByLabel(label, EXACT)).toBeVisible()
  ).toPass();

const entryHasIcon = async (
  selector: string,
  label: RegExp | string,
  page: Page
): Promise<void> =>
  expect(
    page.locator(selector).getByLabel(label, EXACT).locator("img")
  ).not.toHaveAttribute("src", UNKNOWN_ICON_PATH);

export const desktopEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> => entryIsVisible(DESKTOP_ENTRIES_SELECTOR, label, page);

export const fileExplorerAddressBarHasValue = async (
  value: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page
      .locator(FILE_EXPLORER_NAV_SELECTOR)
      .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL, EXACT)
  ).toHaveValue(value);

export const fileExplorerEntryIsHidden = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label, EXACT)
  ).toBeHidden();

export const fileExplorerEntryIsVisible = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> => entryIsVisible(FILE_EXPLORER_ENTRIES_SELECTOR, label, page);

export const fileExplorerEntryHasTooltip = async (
  label: RegExp,
  title: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label)
  ).toHaveAttribute("title", title);

export const fileExplorerNavButtonIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_NAV_SELECTOR).getByLabel(label, EXACT)
  ).toBeVisible();

export const searchResultEntryIsVisible = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(SEARCH_MENU_RESULTS_SELECTOR).getByTitle(label)
  ).toBeVisible();

export const taskbarEntryIsHidden = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(label, EXACT)
  ).toBeHidden();

export const taskbarEntryIsVisible = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> => entryIsVisible(TASKBAR_ENTRY_SELECTOR, label, page);

export const taskbarEntryPeekIsHidden = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(TASKBAR_ENTRY_PEEK_SELECTOR)).toBeHidden();

export const taskbarEntryPeekImageIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(async () =>
    expect(page.locator(TASKBAR_ENTRY_PEEK_IMAGE_SELECTOR)).toBeVisible()
  ).toPass();

export const startMenuEntryIsVisible = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> => entryIsVisible(START_MENU_SELECTOR, label, page);

export const startMenuEntryHasIcon = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> => entryHasIcon(START_MENU_SELECTOR, label, page);

export const startMenuSidebarEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(START_MENU_SIDEBAR_SELECTOR).getByLabel(label)
  ).toBeVisible();

export const startMenuContextIsOpen = async (
  entry: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(async () => {
    await clickStartMenuEntry(entry, { page }, true);
    await contextMenuIsVisible({ page });
  }).toPass();

export const taskbarEntryHasTooltip = async (
  label: RegExp,
  title: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(label)
  ).toHaveAttribute("title", title);

// expect->locator->getBy->getBy
const clockTextLocator = (page: Page): Locator =>
  page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL).getByText(CLOCK_REGEX);

export const clockTextIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(clockTextLocator(page)).toBeHidden();

export const clockTextIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(clockTextLocator(page)).toBeVisible();

// expect->locator->getBy->locator
const clockCanvasLocator = (page: Page): Locator =>
  page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL).locator("canvas");

export const clockCanvasIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(clockCanvasLocator(page)).toBeHidden();

export const clockCanvasIsVisible = async ({
  page,
}: TestProps): Promise<void> => expect(clockCanvasLocator(page)).toBeVisible();

export const taskbarEntryHasIcon = async (
  label: RegExp,
  src: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(label).locator("img")
  ).toHaveAttribute("src", src);

export const fileExplorerEntryHasShortcutIcon = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> => {
  const labelLocator = page
    .locator(FILE_EXPLORER_ENTRIES_SELECTOR)
    .getByLabel(label, EXACT);

  await labelLocator.scrollIntoViewIfNeeded();

  return expect(labelLocator.locator(SHORTCUT_ICON_SELECTOR)).toBeVisible();
};

// expect->locator->getBy->toPass
export const windowTitlebarTextIsVisible = async (
  text: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(async () =>
    expect(
      page.locator(WINDOW_TITLEBAR_SELECTOR).getByText(text, EXACT)
    ).toBeVisible()
  ).toPass();

// expect->locator->first->toPass
const entriesAreVisible = async (selector: string, page: Page): Promise<void> =>
  expect(async () =>
    expect(page.locator(selector).first()).toBeVisible()
  ).toPass();

export const desktopEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  entriesAreVisible(DESKTOP_ENTRIES_SELECTOR, page);

export const fileExplorerEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  entriesAreVisible(FILE_EXPLORER_ENTRIES_SELECTOR, page);

export const taskbarEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> => entriesAreVisible(TASKBAR_ENTRY_SELECTOR, page);

export const terminalHasText = async (
  { page }: TestProps,
  text: string | RegExp,
  count = 1,
  cursorLine = false,
  exact = false
): Promise<void> => {
  const terminalRows = page.locator(TERMINAL_ROWS_SELECTOR);
  const terminalWithTextRows = cursorLine
    ? terminalRows.last().getByText(text, { exact })
    : terminalRows.getByText(text, { exact });

  if (count !== -1) {
    await expect(terminalWithTextRows).toHaveCount(count);
  }

  if (count !== 0) {
    for (const row of await terminalWithTextRows.all()) {
      // eslint-disable-next-line no-await-in-loop
      await expect(row).toBeVisible();
    }
  }
};

export const terminalDoesNotHaveText = async (
  { page }: TestProps,
  text: string,
  cursorLine = false
): Promise<void> => terminalHasText({ page }, text, 0, cursorLine);

export const sendTabToTerminal = async ({ page }: TestProps): Promise<void> => {
  await page.locator(TERMINAL_SELECTOR).press("Tab");

  let checkCount = 0;
  const hasEndingTabCharacter = async (): Promise<boolean> =>
    (await page
      .locator(TERMINAL_ROWS_SELECTOR)
      .last()
      .getByText(new RegExp(`\\s{${TAB_SPACE_LENGTH + CURSOR_SPACE_LENGTH}}$`))
      .count()) > 0;

  /* eslint-disable no-await-in-loop */
  while (checkCount < 10 && (await hasEndingTabCharacter())) {
    checkCount += 1;

    for (let i = 0; i < TAB_SPACE_LENGTH; i += 1) {
      await page.locator(TERMINAL_SELECTOR).press("Backspace");
    }

    await page.locator(TERMINAL_SELECTOR).press("Tab", {
      delay: 100,
    });
  }
  /* eslint-enable no-await-in-loop */
};

export const sendTextToTerminal = async (
  { page }: TestProps,
  text: string
): Promise<void> => page.locator(TERMINAL_SELECTOR).pressSequentially(text);

export const sendToTerminal = async (
  { page }: TestProps,
  text: string
): Promise<void> => {
  const terminal = page.locator(TERMINAL_SELECTOR);

  await terminalHasText({ page }, /.*>$/, 1, true);
  await terminal.pressSequentially(text);
  await terminalHasText({ page }, `>${text}`, 1, true);
  await terminal.press("Enter");
  await terminalDoesNotHaveText({ page }, `>${text}`, true);
};

export const terminalDirectoryMatchesPublicFolder = async (
  { page }: TestProps,
  directory: string
): Promise<void> => {
  await sendToTerminal({ page }, `dir "${directory}"`);

  const publicDirectory = join(ROOT_PUBLIC_FOLDER, directory);
  const dirContents = readdirSync(publicDirectory);
  const fileCount = dirContents.filter((entry) =>
    statSync(join(publicDirectory, entry)).isFile()
  ).length;
  const dirCount = dirContents.length - fileCount;

  await expect(async () => {
    await terminalHasText({ page }, `${fileCount} File(s)`);
    await terminalHasText({ page }, `${dirCount} Dir(s)`);
  }).toPass();
};

export const terminalFileMatchesPublicFile = async (
  { page }: TestProps,
  file: string
): Promise<void> => {
  const fileLines = readFileSync(join(ROOT_PUBLIC_FOLDER, file))
    .toString()
    .split("\r\n")
    .filter(Boolean);

  await Promise.all(fileLines.map((line) => terminalHasText({ page }, line)));
};

export const terminalHasRows = async ({ page }: TestProps): Promise<void> =>
  expect(async () =>
    expect(await page.locator(TERMINAL_ROWS_SELECTOR).count()).toBeGreaterThan(
      0
    )
  ).toPass();

export const windowsAreVisible = async ({ page }: TestProps): Promise<void> =>
  entriesAreVisible(WINDOW_SELECTOR, page);

// meta function
export const backgroundCanvasMaybeIsVisible = async ({
  browserName,
  headless,
  page,
}: TestProps): Promise<void> => {
  if (!headless || !browserName) {
    await expect(async () =>
      expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeVisible()
    ).toPass();
  }
};

export const clockCanvasMaybeIsVisible = async ({
  browserName,
  page,
}: TestPropsWithBrowser): Promise<void> => {
  if (WEBGL_OFFSCREEN_NOT_SUPPORTED_BROWSERS.has(browserName)) {
    await clockTextIsVisible({ page });
    await clockCanvasIsHidden({ page });
  } else {
    await clockCanvasIsVisible({ page });
    await clockTextIsHidden({ page });
  }
};

export const appIsOpen = async (
  label: RegExp | string,
  page: Page
): Promise<void> => {
  await taskbarEntriesAreVisible({ page });
  await taskbarEntryIsVisible(label, { page });

  await windowsAreVisible({ page });
  await windowTitlebarTextIsVisible(label, { page });
};

export const selectArea = async ({
  container = SELECTION_SELECTOR,
  page,
  selection,
}: TestPropsWithSelection): Promise<void> => {
  const { x = 0, y = 0, width = 0, height = 0, up = false } = selection || {};
  await page.mouse.move(x, y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(x + width, y + height);

  await expect(page.locator(container)).toBeVisible();

  const boundingBox = await page.locator(container).boundingBox();

  expect(boundingBox?.width).toEqual(width);
  expect(boundingBox?.height).toEqual(height);
  expect(boundingBox?.x).toEqual(x);
  expect(boundingBox?.y).toEqual(y);

  if (up) await page.mouse.up({ button: "left" });
};

// loaders
export const loadApp =
  (queryParams?: Record<string, string>) =>
  async ({ page }: TestProps): Promise<Response | null> => {
    await page.addInitScript((session) => {
      window.DEBUG_DEFAULT_SESSION = session;
    }, DEFAULT_SESSION);

    return page.goto(
      queryParams ? `/?${new URLSearchParams(queryParams).toString()}` : "/"
    );
  };

export const loadTestApp = async ({
  page,
}: TestProps): Promise<Response | null> => loadApp({ app: TEST_APP })({ page });

export const loadContainerTestApp = async ({
  page,
}: TestProps): Promise<Response | null> =>
  loadApp({ app: TEST_APP_CONTAINER_APP })({ page });

export const loadAppWithCanvas = async ({
  headless,
  browserName,
  page,
}: TestProps): Promise<void> => {
  await loadApp()({ page });
  await backgroundCanvasMaybeIsVisible({ browserName, headless, page });
};
