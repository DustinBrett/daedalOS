import { expect, test } from "@playwright/test";
import { START_MENU_SELECTOR } from "e2e/constants";
import {
  clickDesktop,
  clickStartButton,
  loadApp,
  startMenuIsHidden,
  startMenuIsVisible,
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(clickStartButton);
test.beforeEach(startMenuIsVisible);

test.describe("has sidebar", () => {
  test("with buttons", async ({ page }) => {
    const startMenu = page.locator(START_MENU_SELECTOR);

    await expect(startMenu.getByLabel(/^All apps$/)).toBeVisible();
    await expect(startMenu.getByLabel(/^Power$/)).toBeVisible();
  });

  // TODO: can expand
});

test("has folders", async ({ page }) => {
  const startMenu = page.locator(START_MENU_SELECTOR);

  await expect(startMenu.getByLabel(/^Emulators$/)).toBeVisible();
  await expect(startMenu.getByLabel(/^Games$/)).toBeVisible();

  // TODO: w/read-only context menu
});

test.describe("can close", () => {
  test("via button", async ({ page }) => {
    await clickStartButton({ page });
    await startMenuIsHidden({ page });
  });

  test("via blur", async ({ page }) => {
    await clickDesktop({ page });
    await startMenuIsHidden({ page });
  });
});

// TODO: has files, w/read-only context menu
