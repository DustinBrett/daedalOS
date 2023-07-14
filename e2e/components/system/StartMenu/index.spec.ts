import { expect, test } from "@playwright/test";

test("has sidebar buttons", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Start").click();

  await expect(page.getByLabel("All apps")).toBeVisible();
  await expect(page.getByLabel("Power")).toBeVisible();
});

test("has folders", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Start").click();

  await expect(page.getByLabel("Emulators")).toBeVisible();
  await expect(page.getByLabel("Games")).toBeVisible();
});
