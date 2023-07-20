import { test } from "@playwright/test";
import {
  DESKTOP_ENTRIES_SELECTOR,
  FILE_DRAG_TESTING_FAILS_BROWSERS,
  TEST_APP_CONTAINER_APP,
  TEST_APP_CONTAINER_APP_TITLE,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  desktopFileEntriesAreVisible,
  desktopIsVisible,
  windowIsVisible,
  windowTitlebarIsVisible,
  windowTitlebarTextIsVisible,
} from "e2e/functions";

test.describe("app container", () => {
  test.beforeEach(async ({ page }) =>
    page.goto(`/?app=${TEST_APP_CONTAINER_APP}`)
  );

  test.beforeEach(windowIsVisible);

  test("has drop", async ({ browserName, page }) => {
    if (FILE_DRAG_TESTING_FAILS_BROWSERS.has(browserName)) return;

    await windowTitlebarIsVisible({ page });
    await windowTitlebarTextIsVisible(TEST_APP_CONTAINER_APP, { page });

    await desktopIsVisible({ page });
    await desktopFileEntriesAreVisible({ page });

    const file = page.locator(DESKTOP_ENTRIES_SELECTOR).first();

    await file.dragTo(page.locator(WINDOW_SELECTOR));

    await windowTitlebarTextIsVisible(
      TEST_APP_CONTAINER_APP_TITLE(await file.textContent()),
      { page }
    );
  });

  // TODO: has loading
});

// TODO: iframe app -> loads url (Browser, IRC, Paint)
