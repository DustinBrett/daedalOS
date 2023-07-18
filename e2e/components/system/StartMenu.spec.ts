import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  await page.getByLabel(/^Start$/).click();
});

test("has sidebar buttons", async ({ page }) => {
  await expect(page.getByLabel(/^All apps$/)).toBeVisible();
  await expect(page.getByLabel(/^Power$/)).toBeVisible();
});

test("has folders", async ({ page }) => {
  await expect(page.getByLabel(/^Emulators$/)).toBeVisible();
  await expect(page.getByLabel(/^Games$/)).toBeVisible();

  // TODO: w/read-only context menu
});

// TODO: has files, w/read-only context menu
// TODO: has sidebar
// TODO: can close (start button, blur)
