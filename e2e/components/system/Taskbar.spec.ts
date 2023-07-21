import { test } from "@playwright/test";
import { TEST_APP_ICON, TEST_APP_TITLE } from "e2e/constants";
import {
  calendarIsVisible,
  clickClock,
  clickStartButton,
  clockCanvasIsHidden,
  clockCanvasOrTextIsVisible,
  clockIsVisible,
  clockTextIsVisible,
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

    test("with sheep", async ({ page }) => {
      await page.keyboard.down("Control");
      await page.keyboard.down("Shift");

      await clickStartButton({ page });
      await sheepIsVisible({ page });
    });

    // TODO: has context menu
  });

  test.describe("has clock", () => {
    test.beforeEach(clockIsVisible);

    test("via canvas", clockCanvasOrTextIsVisible);

    test("via text", async ({ page }) => {
      await disableOffscreenCanvas({ page });
      await page.reload();

      await clockTextIsVisible({ page });
      await clockCanvasIsHidden({ page });
    });

    test("with sheep", async ({ page }) => {
      await clickClock({ page }, 7);
      await sheepIsVisible({ page });
    });

    test("has calendar", async ({ page }) => {
      await clickClock({ page });
      await calendarIsVisible({ page });
    });
    // TODO: has context menu
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

    test("with icon", async ({ page }) =>
      taskbarEntryHasIcon(TEST_APP_TITLE, TEST_APP_ICON, { page }));

    test("with tooltip", async ({ page }) =>
      taskbarEntryHasTooltip(TEST_APP_TITLE, TEST_APP_TITLE, { page }));

    // TODO: has context menu
    // TODO: can minimize & restore
    // TODO: has peek
  });

  // TODO: has context menu
});
