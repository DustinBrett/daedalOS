import { test } from "@playwright/test";
import {
  clickSearchButton,
  disableWallpaper,
  loadApp,
  searchMenuIsHidden,
  searchMenuIsVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);
test.beforeEach(loadApp);
test.beforeEach(async ({ page }) => clickSearchButton({ page }));
test.beforeEach(searchMenuIsVisible);

test.describe("can close", () => {
  test("via button", async ({ page }) => {
    await clickSearchButton({ page });
    await searchMenuIsHidden({ page });
  });
});
