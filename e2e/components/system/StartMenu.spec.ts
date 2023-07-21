import { test } from "@playwright/test";
import {
  clickDesktop,
  clickStartButton,
  disableWallpaper,
  loadApp,
  startMenuEntryIsVisible,
  startMenuIsHidden,
  startMenuIsVisible,
  startMenuSidebarEntryIsVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);
test.beforeEach(loadApp);
test.beforeEach(clickStartButton);
test.beforeEach(startMenuIsVisible);

test.describe("has sidebar", () => {
  test("with buttons", async ({ page }) => {
    await startMenuSidebarEntryIsVisible(/^All apps$/, { page });
    await startMenuSidebarEntryIsVisible(/^Power$/, { page });
  });

  // TODO: can expand
});

test("has folders", async ({ page }) => {
  await startMenuEntryIsVisible(/^Emulators$/, { page });
  await startMenuEntryIsVisible(/^Games$/, { page });

  // TODO: w/read-only context menu
});

// TODO: has files, w/read-only context menu

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
