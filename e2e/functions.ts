import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  BACKGROUND_CANVAS_SELECTOR,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ELEMENT,
  DESKTOP_FILE_ENTRY_SELECTOR,
  FILE_EXPLORER_FILE_ENTRY_SELECTOR,
  SHEEP_SELECTOR,
  START_BUTTON_LABEL,
  START_MENU_SELECTOR,
  TASKBAR_ENTRY_SELECTOR,
  TASKBAR_SELECTOR,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
} from "e2e/constants";

type TestProps = {
  page: Page;
};

export const waitForAnimation = async (
  selector: string,
  { page }: TestProps
): Promise<Animation[]> =>
  page
    .locator(selector)
    .evaluate((element) =>
      Promise.all(
        element.getAnimations().map((animation) => animation.finished)
      )
    );

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
  expect(page.getByRole(DESKTOP_ELEMENT)).toBeVisible();

export const desktopEntryIsHidden = async (
  entry: RegExp,
  { page }: TestProps
): Promise<void> => {
  await expect
    .poll(() => page.locator(DESKTOP_FILE_ENTRY_SELECTOR).count())
    .toBeGreaterThan(0);
  await expect(page.getByLabel(entry)).toBeHidden();
};

export const desktopEntryIsVisible = async (
  entry: RegExp,
  { page }: TestProps
): Promise<void> => {
  await expect
    .poll(() => page.locator(DESKTOP_FILE_ENTRY_SELECTOR).count())
    .toBeGreaterThan(1);
  await expect(page.getByLabel(entry)).toBeVisible();
};

export const desktopFileEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> => {
  const desktopFileEntry = page.locator(DESKTOP_FILE_ENTRY_SELECTOR);

  await expect.poll(() => desktopFileEntry.count()).toBeGreaterThan(0);
  await expect.poll(() => desktopFileEntry.first().isVisible()).toBeTruthy();
};

export const taskbarEntryIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(TASKBAR_ENTRY_SELECTOR)).toBeVisible();

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

export const sheepIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(SHEEP_SELECTOR)).toBeVisible();

export const startButtonIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.getByLabel(START_BUTTON_LABEL)).toBeVisible();

export const startMenuIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.getByLabel(START_MENU_SELECTOR)).toBeHidden();

export const startMenuIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.getByLabel(START_MENU_SELECTOR)).toBeVisible();

export const windowIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toBeHidden();

export const windowIsOpaque = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toHaveCSS("opacity", "1");

export const windowIsTransparent = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toHaveCSS("opacity", "0");

export const windowIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect.poll(() => page.locator(WINDOW_SELECTOR).isVisible()).toBeTruthy();

export const windowTitlebarIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_TITLEBAR_SELECTOR)).toBeVisible();

export const windowTitlebarEqualsText = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  expect
    .poll(() => page.locator(WINDOW_TITLEBAR_SELECTOR).textContent())
    .toEqual(text);

export const fileExplorerFileIsHidden = async (
  file: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR).getByLabel(file)).toBeHidden();

export const fileExplorerFileEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> => {
  await page.waitForSelector(FILE_EXPLORER_FILE_ENTRY_SELECTOR);

  const fileExplorerFileEntry = page.locator(FILE_EXPLORER_FILE_ENTRY_SELECTOR);

  await expect.poll(() => fileExplorerFileEntry.count()).toBeGreaterThan(0);
  await expect
    .poll(() => fileExplorerFileEntry.first().isVisible())
    .toBeTruthy();
};

export const fileExplorerFileIsVisible = async (
  file: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect
    .poll(() => page.locator(WINDOW_SELECTOR).getByLabel(file).isVisible())
    .toBeTruthy();

export const clickFirstDesktopFileEntry = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(DESKTOP_FILE_ENTRY_SELECTOR).first().click();

export const focusOnWindow = async ({ page }: TestProps): Promise<void> =>
  page.locator(WINDOW_SELECTOR).focus();

export const clickStartButton = async ({ page }: TestProps): Promise<void> =>
  page.getByLabel(START_BUTTON_LABEL).click();

export const backgroundIsUrl = async ({ page }: TestProps): Promise<void> =>
  expect(
    await page.waitForFunction(
      ([selectorProperty, selectorValue]) =>
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(selectorProperty)
          .match(selectorValue),
      ["background-image", /^url\(.*?\)$/] as [string, RegExp]
    )
  ).toBeTruthy();

export const loadApp = async ({ page }: TestProps): Promise<Response | null> =>
  page.goto("/");

export const disableOffscreenCanvas = (): void => {
  delete (window as Partial<Window & typeof globalThis>).OffscreenCanvas;
};
