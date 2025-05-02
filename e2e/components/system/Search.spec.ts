import { expect, test } from "@playwright/test";
import { TEST_SEARCH, TEST_SEARCH_RESULT_TITLE } from "e2e/constants";
import {
  captureConsoleLogs,
  clickSearchButton,
  disableWallpaper,
  loadApp,
  searchMenuIsHidden,
  searchMenuIsVisible,
  searchResultEntryIsVisible,
  typeInTaskbarSearchBar,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);
test.beforeEach(loadApp());
test.beforeEach(async ({ page }) => clickSearchButton({ page }));
test.beforeEach(searchMenuIsVisible);

test.describe("can close", () => {
  test("via button", async ({ page }) => {
    await clickSearchButton({ page });
    await searchMenuIsHidden({ page });
  });
});

test.describe("can search", () => {
  test("via 'All' tab", async ({ page }) => {
    await typeInTaskbarSearchBar(TEST_SEARCH, { page });
    await expect(() =>
      searchResultEntryIsVisible(TEST_SEARCH_RESULT_TITLE, { page })
    ).toPass();
  });
});
