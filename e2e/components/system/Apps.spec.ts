import { test } from "@playwright/test";
import {
  DESKTOP_ENTRIES_SELECTOR,
  FILE_DRAG_TESTING_FAILS_BROWSERS,
  TEST_APP_CONTAINER_APP,
  TEST_APP_CONTAINER_APP_TITLE,
} from "e2e/constants";
import {
  desktopFileEntriesAreVisible,
  desktopIsVisible,
  dragFirstDesktopEntryToWindow,
  loadContainerTestApp,
  windowIsVisible,
  windowTitlebarIsVisible,
  windowTitlebarTextIsVisible,
} from "e2e/functions";

test.describe("app container", () => {
  test.beforeEach(loadContainerTestApp);

  // TODO: Make windowIsStable
  test.beforeEach(windowIsVisible);

  test("has drop", async ({ browserName, page }) => {
    if (FILE_DRAG_TESTING_FAILS_BROWSERS.has(browserName)) return;

    await windowTitlebarIsVisible({ page });
    await windowTitlebarTextIsVisible(TEST_APP_CONTAINER_APP, { page });

    await desktopIsVisible({ page });
    await desktopFileEntriesAreVisible({ page });

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
