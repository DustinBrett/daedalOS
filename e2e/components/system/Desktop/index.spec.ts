import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

const RIGHT_CLICK = { button: "right" } as Parameters<Locator["click"]>[0];

const BACKGROUND_CANVAS_SELECTOR = "main>canvas";
const FIRST_FILE_ENTRY_SELECTOR = "main>ol>li:first-child";
const CONTEXT_MENU_SELECTOR = "#__next>nav";

const SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);

test("has background", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toHaveCount(1);
});

test("has file entry", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(FIRST_FILE_ENTRY_SELECTOR)).toHaveCount(1);
});

test.describe("has context menu", () => {
  test("with items", async ({ browserName, page }) => {
    await page.goto("/");

    await page.locator("main").click(RIGHT_CLICK);

    const menuItems = page.locator(CONTEXT_MENU_SELECTOR).locator("ol>li");

    await expect(menuItems.getByLabel(/^Background$/)).toHaveCount(1);
    await expect(menuItems.getByLabel(/^New$/)).toHaveCount(1);
    await expect(menuItems.getByLabel(/^View page source$/)).toHaveCount(1);
    await expect(menuItems.getByLabel(/^Inspect$/)).toHaveCount(1);

    await expect(menuItems.getByLabel(/^Capture screen$/)).toHaveCount(
      SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS.has(browserName) ? 0 : 1
    );

    await expect(menuItems.getByLabel(/^Properties$/)).toHaveCount(0);
  });

  test("can change background", async ({ page }) => {
    await page.goto("/");

    await page.locator("main").click(RIGHT_CLICK);

    await page.getByLabel(/^Background$/).click();
    await page.getByLabel(/^APOD$/).click();

    await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toHaveCount(0);
  });

  test("can create folder", async ({ page }) => {
    await page.goto("/");

    await page.locator("main").click(RIGHT_CLICK);

    await page.getByLabel(/^New$/).click();
    await page.getByLabel(/^Folder$/).click();

    await page.locator("main").click();

    await expect(page.getByLabel(/^New folder$/)).toHaveCount(1);
  });

  test("can create file", async ({ page }) => {
    await page.goto("/");

    await page.locator("main").click(RIGHT_CLICK);

    await page.getByLabel(/^New$/).click();
    await page.getByLabel(/^Text Document$/).click();

    await page.locator("main").click();

    await expect(page.getByLabel(/^New Text Document.txt$/)).toHaveCount(1);
  });
});
