import { expect, test } from "@playwright/test";
import {
  START_MENU_APPS,
  START_MENU_FOLDERS,
  START_MENU_SIDEBAR_SELECTOR,
} from "e2e/constants";
import {
  captureConsoleLogs,
  clickDesktop,
  clickStartButton,
  clickStartMenuEntry,
  contextMenuEntryIsVisible,
  contextMenuHasCount,
  desktopEntriesAreVisible,
  disableWallpaper,
  loadApp,
  pressDesktopKeys,
  searchMenuIsHidden,
  searchMenuIsVisible,
  startMenuContextIsOpen,
  startMenuEntryHasIcon,
  startMenuEntryIsVisible,
  startMenuIsHidden,
  startMenuIsVisible,
  startMenuSidebarEntryIsVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);
test.beforeEach(loadApp());
test.beforeEach(async ({ page }) => clickStartButton({ page }));
test.beforeEach(startMenuIsVisible);

test.describe("has sidebar", () => {
  test("has buttons", async ({ page }) => {
    await startMenuSidebarEntryIsVisible(/^All apps$/, { page });
    await startMenuSidebarEntryIsVisible(/^Power$/, { page });
  });

  test("can expand", async ({ page }) => {
    const { width = 0 } =
      (await page.locator(START_MENU_SIDEBAR_SELECTOR).boundingBox()) || {};

    await page.locator(START_MENU_SIDEBAR_SELECTOR).click();

    await expect(async () =>
      expect(
        (await page.locator(START_MENU_SIDEBAR_SELECTOR).boundingBox())
          ?.width || 0
      ).toBeGreaterThan(width)
    ).toPass();
  });
});

test.describe("has folders", () => {
  test.beforeEach(desktopEntriesAreVisible);

  const MENU_FOLDERS = Object.keys(START_MENU_FOLDERS);

  test("has items", async ({ page }) => {
    for (const label of MENU_FOLDERS) {
      // eslint-disable-next-line no-await-in-loop
      await startMenuEntryIsVisible(label, { page });
    }
  });

  test("has context menu (read only)", async ({ page }) => {
    const [firstEntry] = MENU_FOLDERS;

    await startMenuEntryIsVisible(firstEntry, { page });
    await startMenuContextIsOpen(firstEntry, { page });
    await contextMenuEntryIsVisible(/^Open$/, { page });
    await contextMenuHasCount(1, { page });
  });

  test("has sub menus", async ({ page }) => {
    for (const [folder, entries] of Object.entries(START_MENU_FOLDERS)) {
      // eslint-disable-next-line no-await-in-loop
      await clickStartMenuEntry(folder, { page });

      for (const label of entries) {
        // eslint-disable-next-line no-await-in-loop
        await startMenuEntryIsVisible(label, { page });
      }
    }
  });
});

test.describe("has files", () => {
  test.beforeEach(desktopEntriesAreVisible);

  test("has items", async ({ page }) => {
    for (const label of START_MENU_APPS) {
      // eslint-disable-next-line no-await-in-loop
      await startMenuEntryIsVisible(label, { page });
      // eslint-disable-next-line no-await-in-loop
      await startMenuEntryHasIcon(label, { page });
    }
  });

  test("has context menu (read only)", async ({ page }) => {
    const [firstEntry] = START_MENU_APPS;

    await startMenuEntryIsVisible(firstEntry, { page });
    await startMenuContextIsOpen(firstEntry, { page });
    await contextMenuEntryIsVisible(/^Open$/, { page });
    await contextMenuHasCount(1, { page });
  });
});

test.describe("can close", () => {
  test("via button", async ({ page }) => {
    await clickStartButton({ page });
    await startMenuIsHidden({ page });
  });

  test("via blur", async ({ page }) => {
    await clickDesktop({ page });
    await startMenuIsHidden({ page });
  });

  test("via escape", async ({ page }) => {
    await pressDesktopKeys("Escape", { page });
    await startMenuIsHidden({ page });
  });

  test("via shift + escape", async ({ page }) => {
    await pressDesktopKeys("Shift+Escape", { page });
    await startMenuIsHidden({ page });
  });

  test("via searching", async ({ page }) => {
    await searchMenuIsHidden({ page });
    await page.keyboard.press("A");
    await startMenuIsHidden({ page });
    await searchMenuIsVisible({ page });
  });
});
