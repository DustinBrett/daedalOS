import { expect, test } from "@playwright/test";

test("has background", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main>canvas")).toHaveCount(1);
});

test("has file entry", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main>ol>li:first-child")).toHaveCount(1);
});

test("has context menu", async ({ browserName, page }) => {
  await page.goto("/");

  await page.locator("main").click({ button: "right" });

  const menu = page.locator("#__next>nav");

  await expect(menu).toHaveCount(1);

  const menuItems = menu.locator("ol>li");

  await expect(menuItems.getByText("Background")).toHaveCount(1);
  await expect(menuItems.getByText("View page source")).toHaveCount(1);
  await expect(menuItems.getByText("Inspect")).toHaveCount(1);

  const screenCaptureNotSupportedBrowsers = ["webkit"];
  const captureScreen = menuItems.getByText("Capture screen");

  await expect(captureScreen).toHaveCount(
    screenCaptureNotSupportedBrowsers.includes(browserName) ? 0 : 1
  );
  await expect(menuItems.getByText("Properties")).toHaveCount(0);
});

test("can change background", async ({ page }) => {
  await page.goto("/");

  await page.locator("main").click({ button: "right" });
  await page.getByText("Background").click();
  await page.getByText("Picture Slideshow").click();

  await expect(page.locator("main>canvas")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("style", /background/);
});
