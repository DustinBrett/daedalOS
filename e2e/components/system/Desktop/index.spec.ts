import { expect, test } from "@playwright/test";

test("has wallpaper", async ({ page }) => {
  await page.goto("/");

  // Default is Vanta.js which creates a canvas
  await expect(page.locator("main>canvas")).toBeVisible();
});

test("has file entry", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main>ol>li:first-child")).toHaveCount(1);
});

test("has context menu", async ({ browserName, page }) => {
  await page.goto("/");

  await page.locator("main").click({ button: "right" });

  const menu = page.locator("#__next>nav");

  await expect(menu).toBeVisible();

  const menuItems = menu.locator("ol>li");

  await expect(menuItems.getByText("Background")).toBeVisible();
  await expect(menuItems.getByText("View page source")).toBeVisible();
  await expect(menuItems.getByText("Inspect")).toBeVisible();

  const unSupportedBrowsers = [
    "webkit", // Screen Capture
  ];
  const captureScreen = menuItems.getByText("Capture screen");

  // eslint-disable-next-line playwright/no-conditional-in-test, unicorn/prefer-ternary
  if (unSupportedBrowsers.includes(browserName)) {
    await expect(captureScreen).toBeHidden();
  } else {
    await expect(captureScreen).toBeVisible();
  }

  await expect(menuItems.getByText("Properties")).toBeHidden();
});
