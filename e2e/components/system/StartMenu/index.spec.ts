import { expect, test } from "@playwright/test";

test("should open start menu and see folders", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Start").click();

  await expect(page.getByLabel("Emulators")).toBeVisible();
  await expect(page.getByLabel("Games")).toBeVisible();
});
