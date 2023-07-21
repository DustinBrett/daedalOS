import { test } from "@playwright/test";
import {
  OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS,
  TEST_APP_ICON,
  TEST_APP_TITLE,
} from "e2e/constants";
import {
  calendarIsVisible,
  clickClock,
  clickStartButton,
  clockCanvasIsHidden,
  clockCanvasIsVisible,
  clockIsVisible,
  clockTextIsHidden,
  clockTextIsVisible,
  disableOffscreenCanvas,
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

    test("via canvas", async ({ browserName, page }) => {
      if (OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS.has(browserName)) {
        await clockTextIsVisible({ page });
        await clockCanvasIsHidden({ page });
      } else {
        await clockTextIsHidden({ page });
        await clockCanvasIsVisible({ page });
      }
    });

    test("via text", async ({ page }) => {
      await page.addInitScript(disableOffscreenCanvas);
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
