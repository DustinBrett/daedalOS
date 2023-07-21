import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  BACKGROUND_CANVAS_SELECTOR,
  CALENDAR_LABEL,
  CLOCK_LABEL,
  CLOCK_REGEX,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ENTRIES_SELECTOR,
  DESKTOP_SELECTOR,
  FAVICON_SELECTOR,
  FILE_EXPLORER_ADDRESS_BAR_LABEL,
  FILE_EXPLORER_ENTRIES_SELECTOR,
  FILE_EXPLORER_NAV_SELECTOR,
  FILE_EXPLORER_SEARCH_BOX_LABEL,
  POLLING_OPTIONS,
  RIGHT_CLICK,
  SHEEP_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
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

export const disableOffscreenCanvas = (): void => {
  delete (window as Partial<Window & typeof globalThis>).OffscreenCanvas;
};

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
      x: (initialBoundingBox?.width || 0) / 2,
      y: (initialBoundingBox?.height || 0) / 2,
    },
  });
};

export const focusOnWindow = async ({ page }: TestProps): Promise<void> =>
  page.locator(WINDOW_SELECTOR).focus();

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

export const clickFileExplorerAddressBar = async (
  { page }: TestProps,
  right = false
): Promise<void> =>
  page
    .locator(FILE_EXPLORER_NAV_SELECTOR)
    .getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL)
    .click(right ? RIGHT_CLICK : undefined);

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
    .locator(WINDOW_SELECTOR)
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

// expect->waitForFunction (Q: Could these be a poll/eval?)
export const backgroundIsUrl = async ({ page }: TestProps): Promise<void> =>
  expect(
    await page.waitForFunction(() =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("background-image")
        .match(/^url\(.*?\)$/)
    )
  ).toBeTruthy();

// TODO: Fails on CI?
export const windowIsMaximized = async ({ page }: TestProps): Promise<void> =>
  expect(
    await page.waitForFunction(
      ([windowSelector, taskbarSelector]: string[]) =>
        window.innerWidth ===
          (document.querySelector(windowSelector) as HTMLElement)
            ?.clientWidth &&
        window.innerHeight -
          ((document.querySelector(taskbarSelector) as HTMLElement)
            ?.clientHeight || 0) ===
          (document.querySelector(windowSelector) as HTMLElement)?.clientHeight,
      [WINDOW_SELECTOR, TASKBAR_SELECTOR]
    )
  ).toBeTruthy();

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

export const clockIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL)).toBeVisible();

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

export const taskbarEntryHasTooltip = async (
  label: RegExp,
  title: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(label)
  ).toHaveAttribute("title", title);

export const windowTitlebarTextIsVisible = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(WINDOW_TITLEBAR_SELECTOR).getByText(text)).toBeVisible();

// expect->locator->getBy->getBy
export const clockTextIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(
    page
      .locator(TASKBAR_SELECTOR)
      .getByLabel(CLOCK_LABEL)
      .getByText(CLOCK_REGEX)
  ).toBeHidden();

export const clockTextIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(
    page
      .locator(TASKBAR_SELECTOR)
      .getByLabel(CLOCK_LABEL)
      .getByText(CLOCK_REGEX)
  ).toBeVisible();

// expect->locator->getBy->locator
export const clockCanvasIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(
    page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL).locator("canvas")
  ).toBeHidden();

export const clockCanvasIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(
    page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL).locator("canvas")
  ).toBeVisible();

export const taskbarEntryHasIcon = async (
  label: RegExp,
  src: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(label).locator("img")
  ).toHaveAttribute("src", src);

// expect->poll_count->poll_locator_first
export const desktopEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(async () =>
    expect(page.locator(DESKTOP_ENTRIES_SELECTOR).first()).toBeVisible()
  ).toPass(POLLING_OPTIONS);

export const fileExplorerEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(async () =>
    expect(page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).first()).toBeVisible()
  ).toPass(POLLING_OPTIONS);

export const taskbarEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(async () =>
    expect(page.locator(TASKBAR_ENTRIES_SELECTOR).first()).toBeVisible()
  ).toPass(POLLING_OPTIONS);

export const windowsAreVisible = async ({ page }: TestProps): Promise<void> =>
  expect(async () =>
    expect(page.locator(WINDOW_SELECTOR).first()).toBeVisible()
  ).toPass(POLLING_OPTIONS);
