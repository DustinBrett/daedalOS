import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  BACKGROUND_CANVAS_SELECTOR,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ENTRIES_SELECTOR,
  DESKTOP_SELECTOR,
  FILE_EXPLORER_ENTRIES_SELECTOR,
  SHEEP_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
  TASKBAR_ENTRIES_SELECTOR,
  TASKBAR_SELECTOR,
  WINDOW_SELECTOR,
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

// locator->first->action
export const clickFirstDesktopEntry = async ({
  page,
}: TestProps): Promise<void> =>
  page.locator(DESKTOP_ENTRIES_SELECTOR).first().click();

// locator->action
export const clickStartButton = async ({ page }: TestProps): Promise<void> =>
  page.locator(START_BUTTON_SELECTOR).click();

export const focusOnWindow = async ({ page }: TestProps): Promise<void> =>
  page.locator(WINDOW_SELECTOR).focus();

// Q: Is this even needed?
export const windowAnimationIsFinished = async ({
  page,
}: TestProps): Promise<Animation[]> =>
  page
    .locator(WINDOW_SELECTOR)
    .evaluate((element) =>
      Promise.all(element.getAnimations().map(({ finished }) => finished))
    );

// expect->waitForFunction (Could these be a poll/eval?)
export const backgroundIsUrl = async ({ page }: TestProps): Promise<void> =>
  expect(
    await page.waitForFunction(() =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("background-image")
        .match(/^url\(.*?\)$/)
    )
  ).toBeTruthy();

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

// expect->locator->getBy
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

export const fileExplorerEntryIsHidden = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label)
  ).toBeHidden();

export const fileExplorerEntryIsVisible = async (
  label: RegExp,
  { page }: TestProps
): Promise<void> =>
  expect(
    page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).getByLabel(label)
  ).toBeVisible();

export const windowTitlebarTextIsVisible = async (
  text: string,
  { page }: TestProps
): Promise<void> =>
  expect(page.locator(WINDOW_TITLEBAR_SELECTOR).getByText(text)).toBeVisible();

// expect->locator->first
export const desktopFileEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(DESKTOP_ENTRIES_SELECTOR).first()).toBeVisible();

export const fileExplorerFileEntriesAreVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(FILE_EXPLORER_ENTRIES_SELECTOR).first()).toBeVisible();

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

export const taskbarEntryIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(TASKBAR_ENTRIES_SELECTOR)).toBeVisible();

export const windowIsHidden = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toBeHidden();

export const windowIsVisible = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toBeVisible();

export const windowIsTransparent = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toHaveCSS("opacity", "0");

export const windowIsOpaque = async ({ page }: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_SELECTOR)).toHaveCSS("opacity", "1");

export const windowTitlebarIsVisible = async ({
  page,
}: TestProps): Promise<void> =>
  expect(page.locator(WINDOW_TITLEBAR_SELECTOR)).toBeVisible();
