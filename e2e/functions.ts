import type { Locator, Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  BACKGROUND_CANVAS_SELECTOR,
  CALENDAR_LABEL,
  CLOCK_LABEL,
  CLOCK_REGEX,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ENTRIES_SELECTOR,
  DESKTOP_SELECTOR,
  EXACT,
  FAVICON_SELECTOR,
  FILE_EXPLORER_ADDRESS_BAR_LABEL,
  FILE_EXPLORER_ENTRIES_SELECTOR,
  FILE_EXPLORER_NAV_SELECTOR,
  FILE_EXPLORER_SEARCH_BOX_LABEL,
  OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS,
  RIGHT_CLICK,
  SELECTION_SELECTOR,
  SHEEP_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
  START_MENU_SIDEBAR_SELECTOR,
  TASKBAR_ENTRIES_SELECTOR,
  TASKBAR_SELECTOR,
  TEST_APP,
  TEST_APP_CONTAINER_APP,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_ICON_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
} from "e2e/constants";

type TestProps = {
  page: Page;
};

type TestPropsWithBrowser = TestProps & {
  browserName: string;
};

export const disableOffscreenCanvas = ({ page }: TestProps): Promise<void> =>
  page.addInitScript(() => {
    delete (window as Partial<Window & typeof globalThis>).OffscreenCanvas;
  });

export const disableWallpaper = ({ page }: TestProps): Promise<void> =>
  page.addInitScript(() => {
    window.DEBUG_DISABLE_WALLPAPER = true;
  });

// action
export const loadApp = async ({ page }: TestProps): Promise<Response | null> =>
  page.goto("/");

export const loadTestApp = async ({
  page,
}: TestProps): Promise<Response | null> => page.goto(`/?app=${TEST_APP}`);

export const loadContainerTestApp = async ({
  page,
}: TestProps): Promise<Response | null> =>
  page.goto(`/?app=${TEST_APP_CONTAINER_APP}`);

// locator->action
export const clickDesktop = async (
  { page }: TestProps,
  right = false
): Promise<void> =>
  page.locator(DESKTOP_SELECTOR).click(right ? RIGHT_CLICK : undefined);

export const clickStartButton = async ({ page }: TestProps): Promise<void> =>
  page.locator(START_BUTTON_SELECTOR).click();

export const doubleClickWindowTitlebar = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(WINDOW_TITLEBAR_SELECTOR).dblclick();

export const doubleClickWindowTitlebarIcon = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(WINDOW_TITLEBAR_ICON_SELECTOR).dblclick();

export const dragWindowToDesktop = async ({
  page,
}: TestProps): Promise<void> => {
  const windowTitlebarElement = page.locator(WINDOW_TITLEBAR_SELECTOR);
  const initialBoundingBox = await windowTitlebarElement.boundingBox();

  await windowTitlebarElement.dragTo(page.locator(DESKTOP_SELECTOR), {
    targetPosition: {
      x: Math.floor((initialBoundingBox?.width || 0) / 2),
      y: Math.floor((initialBoundingBox?.height || 0) / 2),
    },
  });
};

export const focusOnWindow = async ({ page }: TestProps): Promise<void> =>
  page.locator(WINDOW_SELECTOR).focus();

export const pressDesktopKeys = async (
  keys: string,
  { page }: TestProps
): Promise<void> => page.locator(DESKTOP_SELECTOR).press(keys);

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
  clickCount = 1
): Promise<void> =>
  page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL).click({ clickCount });

export const clickCloseWindow = async ({ page }: TestProps): Promise<void> =>
  page
    .locator(WINDOW_TITLEBAR_SELECTOR)
    .getByLabel(/^Close$/)
    .click();

export const clickContextMenuEntry = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  page.locator(CONTEXT_MENU_SELECTOR).getByLabel(label).click();

export const clickFileExplorerAddressBar = async (
  { page }: TestProps,
  right = false,
  clickCount = 1
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_NAV_SELECTOR)
    .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL)
    .click({
      button: right ? "right" : undefined,
      clickCount,
    });

export const clickFileExplorerEntry = async (
  label: RegExp,
  { page }: TestProps,
  right = false
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_ENTRIES_SELECTOR)
    .getByLabel(label)
    .click(right ? RIGHT_CLICK : undefined);

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

export const typeInFileExplorerSearchBox = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_NAV_SELECTOR)
    .getByLabel(FILE_EXPLORER_SEARCH_BOX_LABEL)
    .type(text, { delay: 50 });

// expect->toHave
export const pageHasTitle = async (
  title: string,
  { page }: TestProps
): Promise<void> => expect(page).toHaveTitle(title);

// expect->locator->toHave
export const pageHasIcon = async (
  icon: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(FAVICON_SELECTOR)).toHaveAttribute("href", icon);

// expect->evaluate
export const backgroundIsUrl = async ({ page }: TestProps): Promise<void> =>
  expect(async () =>
    expect(
      await page.evaluate(() =>
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("background-image")
          .match(/^url\(.*?\)$/)
      )
    ).toBeTruthy()
  ).toPass();

export const windowIsMaximized = async ({ page }: TestProps): Promise<void> =>
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
    ).toBeTruthy()
  ).toPass();

// expect->locator
export const canvasBackgroundIsHidden = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeHidden();

export const canvasBackgroundIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeVisible();

export const contextMenuIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(CONTEXT_MENU_SELECTOR)).toBeVisible();

export const desktopIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(DESKTOP_SELECTOR)).toBeVisible();

export const selectionIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(SELECTION_SELECTOR)).toBeVisible();

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

export const windowTitlebarIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_TITLEBAR_SELECTOR)).toBeVisible();

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
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(label, EXACT)
  ).toBeHidden();

export const contextMenuEntryIsVisible = async (
  label: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(label, EXACT)
  ).toBeVisible();

export const desktopEntryIsHidden = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(DESKTOP_ENTRIES_SELECTOR).getByLabel(label)).toBeHidden();

export const desktopEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(DESKTOP_ENTRIES_SELECTOR).getByLabel(label)
  ).toBeVisible();

export const fileExplorerAddressBarHasValue = async (
  value: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page
      .locator(FILE_EXPLORER_NAV_SELECTOR)
      .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL)
  ).toHaveValue(value);

export const fileExplorerEntryIsHidden = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label)
  ).toBeHidden();

export const fileExplorerEntryHasTooltip = async (
  label: RegExp,
  title: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label)
  ).toHaveAttribute("title", title);

export const taskbarEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(label)
  ).toBeVisible();

export const startMenuEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(START_MENU_SELECTOR).getByLabel(label)).toBeVisible();

export const startMenuSidebarEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(START_MENU_SIDEBAR_SELECTOR).getByLabel(label)
  ).toBeVisible();

export const taskbarEntryHasTooltip = async (
  label: RegExp,
  title: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(label)
  ).toHaveAttribute("title", title);

export const windowTitlebarTextIsVisible = async (
  text: RegExp | string,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(WINDOW_TITLEBAR_SELECTOR).getByText(text, EXACT)
  ).toBeVisible();

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
    page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(label).locator("img")
  ).toHaveAttribute("src", src);

// expect->poll_count->poll_locator_first
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
}: TestProps): Promise<void> =>
  entriesAreVisible(TASKBAR_ENTRIES_SELECTOR, page);

export const windowsAreVisible = async ({ page }: TestProps): Promise<void> =>
  entriesAreVisible(WINDOW_SELECTOR, page);

// meta function
export const clockCanvasOrTextIsVisible = async ({
  browserName,
  page,
}: TestPropsWithBrowser): Promise<void> => {
  if (OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS.has(browserName)) {
    await clockTextIsVisible({ page });
    await clockCanvasIsHidden({ page });
  } else {
    await clockTextIsHidden({ page });
    await clockCanvasIsVisible({ page });
  }
};

export const taskbarEntryIsOpen = async (
  label: RegExp,
  page: Page
): Promise<void> => {
  await taskbarEntriesAreVisible({ page });
  await taskbarEntryIsVisible(label, { page });
};
