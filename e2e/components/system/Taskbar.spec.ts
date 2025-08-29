import { test } from "@playwright/test";
import {
  CLOCK_MENU_ITEMS,
  START_BUTTON_MENU_ITEMS,
  TASKBAR_ENTRIES_MENU_ITEMS,
  TASKBAR_ENTRY_MENU_ITEMS,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  WEBGPU_HEADLESS_NOT_SUPPORTED_BROWSERS,
} from "e2e/constants";
import {
  calendarIsVisible,
  captureConsoleLogs,
  clickClock,
  clickContextMenuEntry,
  clickStartButton,
  clickTaskbar,
  clickTaskbarEntry,
  clockCanvasIsHidden,
  clockCanvasMaybeIsVisible,
  clockTextIsVisible,
  contextMenuEntryIsVisible,
  contextMenuHasCount,
  contextMenuIsVisible,
  disableOffscreenCanvas,
  disableWallpaper,
  fileExplorerEntriesAreVisible,
  hoverOnTaskbarEntry,
  loadApp,
  loadTestApp,
  sheepIsVisible,
  startButtonIsVisible,
  taskbarEntriesAreVisible,
  taskbarEntryHasIcon,
  taskbarEntryHasTooltip,
  taskbarEntryIsHidden,
  taskbarEntryIsVisible,
  taskbarEntryPeekImageIsVisible,
  taskbarEntryPeekIsHidden,
  taskbarIsVisible,
  windowIsMaximized,
  windowIsOpaque,
  windowIsTransparent,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);

test.describe("elements", () => {
  test.beforeEach(loadApp());
  test.beforeEach(taskbarIsVisible);

  test.describe("has start button", () => {
    test.beforeEach(startButtonIsVisible);

    test("can spawn sheep", async ({ page }) => {
      await page.keyboard.down("Control");
      await page.keyboard.down("Shift");

      await clickStartButton({ page });
      await sheepIsVisible({ page });
    });

    test("has context menu", async ({ page }) => {
      await clickStartButton({ page }, true);
      await contextMenuIsVisible({ page });
      await contextMenuHasCount(START_BUTTON_MENU_ITEMS.length, { page });

      for (const label of START_BUTTON_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await contextMenuEntryIsVisible(label, { page });
      }
    });
  });

  test.describe("has clock", () => {
    test("via canvas", clockCanvasMaybeIsVisible);

    test("via text", async ({ page }) => {
      await disableOffscreenCanvas({ page });
      await page.reload();

      await clockTextIsVisible({ page });
      await clockCanvasIsHidden({ page });
    });

    test("can spawn sheep", async ({ page }) => {
      await clickClock({ page }, 7);
      await sheepIsVisible({ page });
    });

    test("has calendar", async ({ page }) => {
      await clickClock({ page });
      await calendarIsVisible({ page });
    });

    test("has context menu", async ({ page }) => {
      await clickClock({ page }, 1, true);
      await contextMenuIsVisible({ page });
      await contextMenuHasCount(CLOCK_MENU_ITEMS.length, { page });

      for (const label of CLOCK_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await contextMenuEntryIsVisible(label, { page });
      }
    });
  });
});

test.describe("entries", () => {
  test.beforeEach(loadTestApp);
  test.beforeEach(taskbarIsVisible);
  test.beforeEach(taskbarEntriesAreVisible);
  test.beforeEach(fileExplorerEntriesAreVisible);

  test.describe("has entry", () => {
    test.beforeEach(async ({ page }) =>
      taskbarEntryIsVisible(TEST_APP_TITLE, { page })
    );

    test("has icon", async ({ page }) =>
      taskbarEntryHasIcon(TEST_APP_TITLE, TEST_APP_ICON, { page }));

    test("has tooltip", async ({ page }) =>
      taskbarEntryHasTooltip(TEST_APP_TITLE, TEST_APP_TITLE, { page }));

    test.describe("has context menu", () => {
      test.beforeEach(async ({ page }) => {
        await clickTaskbarEntry(TEST_APP_TITLE, { page }, true);
        await contextMenuIsVisible({ page });
      });

      test("has items", async ({ page }) => {
        await contextMenuHasCount(TASKBAR_ENTRY_MENU_ITEMS.length, { page });

        for (const label of TASKBAR_ENTRY_MENU_ITEMS) {
          // eslint-disable-next-line no-await-in-loop
          await contextMenuEntryIsVisible(label, { page });
        }
      });

      test("can close", async ({ page }) => {
        await clickContextMenuEntry(/^Close$/, { page });
        await taskbarEntryIsHidden(TEST_APP_TITLE, { page });
      });

      test("can minimize & restore", async ({ page }) => {
        await windowIsOpaque({ page });
        await clickContextMenuEntry(/^Minimize$/, { page });
        await windowIsTransparent({ page });

        await clickTaskbarEntry(TEST_APP_TITLE, { page }, true);
        await clickContextMenuEntry(/^Restore$/, { page });
        await windowIsOpaque({ page });
      });

      test("can maximize & restore", async ({ page }) => {
        await clickContextMenuEntry(/^Maximize$/, { page });
        await windowIsMaximized({ page });

        await clickTaskbarEntry(TEST_APP_TITLE, { page }, true);
        await clickContextMenuEntry(/^Restore$/, { page });
        await windowIsMaximized({ page }, false);
      });
    });

    test("can minimize & restore", async ({ page }) => {
      await windowIsOpaque({ page });
      await clickTaskbarEntry(TEST_APP_TITLE, { page });
      await windowIsTransparent({ page });
      await clickTaskbarEntry(TEST_APP_TITLE, { page });
      await windowIsOpaque({ page });
    });

    test("has peek image", async ({ page }) => {
      await taskbarEntryPeekIsHidden({ page });
      await hoverOnTaskbarEntry(TEST_APP_TITLE, { page });
      await taskbarEntryPeekImageIsVisible({ page });
    });
  });

  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      await clickTaskbar({ page }, true);
      await contextMenuIsVisible({ page });
    });

    test("has items", async ({ browserName, page }) => {
      const entries = TASKBAR_ENTRIES_MENU_ITEMS(
        !WEBGPU_HEADLESS_NOT_SUPPORTED_BROWSERS.has(browserName) &&
          !process.env.CI
      );

      await contextMenuHasCount(entries.length, { page });

      for (const label of entries) {
        // eslint-disable-next-line no-await-in-loop
        await contextMenuEntryIsVisible(label, { page });
      }
    });
  });
});
