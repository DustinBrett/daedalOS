import { expect, test } from "@playwright/test";

test.describe("start menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    await page.getByLabel(/^Start$/).click();
  });

  test("has sidebar buttons", async ({ page }) => {
    await expect(page.getByLabel(/^All apps$/)).toHaveCount(1);
    await expect(page.getByLabel(/^Power$/)).toHaveCount(1);
  });

  test("has folders", async ({ page }) => {
    await expect(page.getByLabel(/^Emulators$/)).toHaveCount(1);
    await expect(page.getByLabel(/^Games$/)).toHaveCount(1);
  });
});
