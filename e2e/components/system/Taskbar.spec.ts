import { test } from "@playwright/test";
import {
  CLOCK_MENU_ITEMS,
  START_BUTTON_MENU_ITEMS,
  TEST_APP_ICON,
  TEST_APP_TITLE,
} from "e2e/constants";
import {
  calendarIsVisible,
  clickClock,
  clickStartButton,
  clockCanvasIsHidden,
  clockCanvasMaybeIsVisible,
  clockTextIsVisible,
  contextMenuEntryIsVisible,
  contextMenuHasCount,
  contextMenuIsVisible,
  disableOffscreenCanvas,
  disableWallpaper,
  loadApp,
  loadTestApp,
  sheepIsVisible,
  startButtonIsVisible,
  taskbarEntriesAreVisible,
  taskbarEntryHasIcon,
  taskbarEntryHasTooltip,
  taskbarEntryIsVisible,
  taskbarIsVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);

test.describe("elements", () => {
  test.beforeEach(loadApp);
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

  test.describe("has entry", () => {
    test.beforeEach(taskbarEntriesAreVisible);
    test.beforeEach(async ({ page }) =>
      taskbarEntryIsVisible(TEST_APP_TITLE, { page })
    );

    test("has icon", async ({ page }) =>
      taskbarEntryHasIcon(TEST_APP_TITLE, TEST_APP_ICON, { page }));

    test("has tooltip", async ({ page }) =>
      taskbarEntryHasTooltip(TEST_APP_TITLE, TEST_APP_TITLE, { page }));

    // TEST: has context menu
    // TEST: can minimize & restore
    // TEST: has peek
  });

  // TEST: has context menu
});
