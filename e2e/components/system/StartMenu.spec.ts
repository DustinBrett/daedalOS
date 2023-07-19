import { expect, test } from "@playwright/test";
import { DESKTOP_ELEMENT } from "e2e/constants";
import {
  clickStartButton,
  loadApp,
  startMenuIsHidden,
  startMenuIsVisible,
} from "e2e/functions";

test.beforeEach(async ({ page }) => {
  await loadApp({ page });

  await clickStartButton({ page });
});

test.describe("has sidebar", () => {
  test("with buttons", async ({ page }) => {
    await expect(page.getByLabel(/^All apps$/)).toBeVisible();
    await expect(page.getByLabel(/^Power$/)).toBeVisible();
  });

  // TODO: can expand
});

test("has folders", async ({ page }) => {
  await expect(page.getByLabel(/^Emulators$/)).toBeVisible();
  await expect(page.getByLabel(/^Games$/)).toBeVisible();

  // TODO: w/read-only context menu
});

test.describe("can close", () => {
  test("via click", async ({ page }) => {
    await startMenuIsVisible({ page });

    await clickStartButton({ page });

    await startMenuIsHidden({ page });
  });

  test("via blur", async ({ page }) => {
    await startMenuIsVisible({ page });

    await page.getByRole(DESKTOP_ELEMENT).click();

    await startMenuIsHidden({ page });
  });
});

// TODO: has files, w/read-only context menu
