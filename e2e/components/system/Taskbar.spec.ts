import { expect, test } from "@playwright/test";
import {
  CLOCK_REGEX,
  OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS,
  TASKBAR_ENTRY_SELECTOR,
  TEST_APP,
  TEST_APP_ICON,
  TEST_APP_TITLE,
} from "e2e/constants";

test.describe("elements", () => {
  test.beforeEach(async ({ page }) => page.goto("/"));

  test("has start button", async ({ page }) => {
    await expect(page.getByLabel(/^Start$/)).toBeVisible();

    // TODO: has context menu
    // TODO: has sheep
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
      await page.addInitScript(() => {
        delete (window as Partial<Window & typeof globalThis>).OffscreenCanvas;
      });

      await page.reload();

      await expect(page.getByLabel(/^Clock$/)).toContainText(CLOCK_REGEX);
    });

    // TODO: has context menu
    // TODO: has sheep
  });

  test("has calendar", async ({ page }) => {
    await page.getByLabel(/^Clock$/).click();

    await expect(page.getByLabel(/^Calendar$/)).toBeVisible();
  });
});

test.describe("entries", () => {
  test.beforeEach(async ({ page }) => page.goto(`/?app=${TEST_APP}`));

  test("has entry", async ({ page }) => {
    const entries = page.locator(TASKBAR_ENTRY_SELECTOR);

    await expect(entries).toBeVisible();

    const entry = entries.getByLabel(TEST_APP_TITLE);

    await expect(entry).toBeVisible();
    await expect(entry.locator("img")).toHaveAttribute("src", TEST_APP_ICON);

    // TODO: has context menu
    // TODO: can minimize & restore
    // TODO: has peek
    // TODO: has tooltip
  });

  // TODO: has context menu
});
