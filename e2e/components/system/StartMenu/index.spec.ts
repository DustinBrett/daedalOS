import { expect, test } from "@playwright/test";

test.describe("start menu", () => {
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
  });
});
