import { expect, test } from "@playwright/test";

test("should open start menu and see apps & power buttons", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Start").click();

  await expect(page.getByLabel("All apps")).toBeVisible();
  await expect(page.getByLabel("Power")).toBeVisible();
});
