import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

const APOD_URL = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";

const RIGHT_CLICK = { button: "right" } as Parameters<Locator["click"]>[0];

const CANVAS_SELECTOR = "main>canvas";
const FIRST_FILE_ENTRY_SELECTOR = "main>ol>li:first-child";
const CONTEXT_MENU_SELECTOR = "#__next>nav";

const SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);

test("has background", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(CANVAS_SELECTOR)).toHaveCount(1);
});

test("has file entry", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(FIRST_FILE_ENTRY_SELECTOR)).toHaveCount(1);
});

test("has context menu", async ({ browserName, page }) => {
  await page.goto("/");

  await page.locator("main").click(RIGHT_CLICK);

  const menu = page.locator(CONTEXT_MENU_SELECTOR);

  await expect(menu).toHaveCount(1);

  const menuItems = menu.locator("ol>li");

  await expect(menuItems.getByText("Background")).toHaveCount(1);
  await expect(menuItems.getByText("View page source")).toHaveCount(1);
  await expect(menuItems.getByText("Inspect")).toHaveCount(1);

  const captureScreen = menuItems.getByText("Capture screen");

  await expect(captureScreen).toHaveCount(
    SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS.has(browserName) ? 0 : 1
  );
  await expect(menuItems.getByText("Properties")).toHaveCount(0);
});

test("can change background", async ({ page }) => {
  await page.goto("/");

  const responsePromise = page.waitForResponse(APOD_URL);

  await page.locator("main").click(RIGHT_CLICK);
  await page.getByText("Background").click();
  await page.getByText("APOD").click();

  await expect(page.locator(CANVAS_SELECTOR)).toHaveCount(0);

  expect((await responsePromise).ok()).toBe(true);
});
