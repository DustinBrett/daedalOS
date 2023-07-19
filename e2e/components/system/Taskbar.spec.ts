import { expect, test } from "@playwright/test";
import {
  CLOCK_REGEX,
  OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS,
  TASKBAR_ENTRY_SELECTOR,
  TEST_APP,
  TEST_APP_ICON,
  TEST_APP_TITLE,
} from "e2e/constants";
import {
  clickStartButton,
  disableOffscreenCanvas,
  loadApp,
  sheepIsVisible,
  startButtonIsVisible,
  taskbarEntryIsVisible,
} from "e2e/functions";

test.describe("elements", () => {
  test.beforeEach(loadApp);

  test.describe("has start button", () => {
    test("is visible", startButtonIsVisible);

    test("with sheep", async ({ page }) => {
      await page.keyboard.down("Control");
      await page.keyboard.down("Shift");

      await clickStartButton({ page });
      await sheepIsVisible({ page });
    });

    // TODO: has context menu
  });

  test.describe("has clock", () => {
    test("via canvas", async ({ browserName, page }) => {
      const noCanvasSupport =
        OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS.has(browserName);
      const clock = page.getByLabel(/^Clock$/);

      await expect(clock).toContainText(noCanvasSupport ? CLOCK_REGEX : "");
      await expect(clock.locator("canvas"))[
        noCanvasSupport ? "toBeHidden" : "toBeVisible"
      ]();
    });

    test("via text", async ({ page }) => {
      await page.addInitScript(disableOffscreenCanvas);

      await page.reload();

      await expect(page.getByLabel(/^Clock$/)).toContainText(CLOCK_REGEX);
    });

    test("with sheep", async ({ page }) => {
      test.setTimeout(10000);

      const clock = page.getByLabel(/^Clock$/);

      clock.click({ clickCount: 7 });

      await sheepIsVisible({ page });
    });

    // TODO: has context menu
  });

  test("has calendar", async ({ page }) => {
    await page.getByLabel(/^Clock$/).click();

    await expect(page.getByLabel(/^Calendar$/)).toBeVisible();
  });
});

test.describe("entries", () => {
  test.beforeEach(async ({ page }) => page.goto(`/?app=${TEST_APP}`));

  test.describe("has entry", () => {
    test.beforeEach(taskbarEntryIsVisible);

    test("with title", async ({ page }) =>
      expect(
        page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(TEST_APP_TITLE)
      ).toBeVisible());

    test("with icon", async ({ page }) =>
      expect(
        page
          .locator(TASKBAR_ENTRY_SELECTOR)
          .getByLabel(TEST_APP_TITLE)
          .locator("img")
      ).toHaveAttribute("src", TEST_APP_ICON));

    test("with tooltip", async ({ page }) =>
      expect(
        await page
          .locator(TASKBAR_ENTRY_SELECTOR)
          .getByLabel(TEST_APP_TITLE)
          .getAttribute("title")
      ).toMatch(TEST_APP_TITLE));

    // TODO: has context menu
    // TODO: can minimize & restore
    // TODO: has peek
  });

  // TODO: has context menu
});
