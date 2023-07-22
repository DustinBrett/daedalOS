import { test } from "@playwright/test";
import {
  DESKTOP_ENTRIES_SELECTOR,
  FILE_DRAG_NOT_SUPPORTED_BROWSERS,
  TEST_APP_CONTAINER_APP,
  TEST_APP_CONTAINER_APP_TITLE,
} from "e2e/constants";
import {
  desktopEntriesAreVisible,
  disableWallpaper,
  dragFirstDesktopEntryToWindow,
  loadContainerTestApp,
  windowTitlebarTextIsVisible,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);

test.describe("app container", () => {
  test.beforeEach(loadContainerTestApp);
  test.beforeEach(windowsAreVisible);

  test("has drop", async ({ browserName, page }) => {
    if (FILE_DRAG_NOT_SUPPORTED_BROWSERS.has(browserName)) return;

    await windowTitlebarTextIsVisible(TEST_APP_CONTAINER_APP, { page });

    await desktopEntriesAreVisible({ page });
    await dragFirstDesktopEntryToWindow({ page });

    await windowTitlebarTextIsVisible(
      TEST_APP_CONTAINER_APP_TITLE(
        await page.locator(DESKTOP_ENTRIES_SELECTOR).first().textContent()
      ),
      { page }
    );
  });

  // TODO: has loading
  // TODO: has error
});

// TODO: iframe app -> loads url (Browser, IRC, Paint)
