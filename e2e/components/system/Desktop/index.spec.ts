import { expect, test } from "@playwright/test";
import {
  BACKGROUND_CANVAS_SELECTOR,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_MENU_ITEMS,
  DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS,
  FIRST_FILE_ENTRY_SELECTOR,
  RIGHT_CLICK,
  SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS,
} from "e2e/constants";

test.describe("desktop", () => {
  test.beforeEach(async ({ page }) => page.goto("/"));

  test("has background", async ({ page }) => {
    await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeVisible();
  });

  test("has file entry", async ({ page }) => {
    await expect(page.locator(FIRST_FILE_ENTRY_SELECTOR)).toBeVisible();
  });

  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      await page.locator("main").click(RIGHT_CLICK);
    });

    test("with items", async ({ browserName, page }) => {
      const MENU_ITEMS = [
        ...DESKTOP_MENU_ITEMS,
        [
          /^Capture screen$/,
          !SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS.has(browserName),
        ],
        [
          /^Map directory$/,
          !DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS.has(browserName),
        ],
      ];
      const menuItems = page.locator(CONTEXT_MENU_SELECTOR);

      for (const [label, shown] of MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await expect(menuItems.getByLabel(label as RegExp))[
          shown ? "toBeVisible" : "toBeHidden"
        ]();
      }
    });

    test("can change background", async ({ page }) => {
      await page.getByLabel(/^Background$/).click();
      await page.getByLabel(/^APOD$/).click();

      await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeHidden();
    });

    test("can create folder", async ({ page }) => {
      await page.getByLabel(/^New$/).click();
      await page.getByLabel(/^Folder$/).click();

      await page.locator("main").click();

      await expect(page.getByLabel(/^New folder$/)).toBeVisible();
    });

    test("can create file", async ({ page }) => {
      await page.getByLabel(/^New$/).click();
      await page.getByLabel(/^Text Document$/).click();

      await page.locator("main").click();

      await expect(page.getByLabel(/^New Text Document.txt$/)).toBeVisible();
    });
  });
});
