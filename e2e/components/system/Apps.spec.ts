import { test } from "@playwright/test";
import {
  DESKTOP_ENTRIES_SELECTOR,
  FILE_DRAG_TESTING_FAILS_BROWSERS,
  TEST_APP_CONTAINER_APP,
  TEST_APP_CONTAINER_APP_TITLE,
} from "e2e/constants";
import {
  desktopEntriesAreVisible,
  desktopIsVisible,
  dragFirstDesktopEntryToWindow,
  loadContainerTestApp,
  windowTitlebarIsVisible,
  windowTitlebarTextIsVisible,
  windowsAreVisible,
} from "e2e/functions";

test.describe("app container", () => {
  test.beforeEach(loadContainerTestApp);
  test.beforeEach(windowsAreVisible);

  test("has drop", async ({ browserName, page }) => {
    if (FILE_DRAG_TESTING_FAILS_BROWSERS.has(browserName)) return;

    await windowTitlebarIsVisible({ page });
    await windowTitlebarTextIsVisible(TEST_APP_CONTAINER_APP, { page });

    await desktopIsVisible({ page });
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
